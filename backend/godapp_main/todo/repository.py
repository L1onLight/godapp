from asgiref.sync import sync_to_async
from django.db.models import QuerySet
from loguru import logger as base_logger

from todo.models import TodoItem

logger = base_logger.bind(module="todo.repository")


class TodoItemRepository:
    _model = TodoItem

    class DoesNotExist(Exception):
        pass

    @classmethod
    def get_todo_by_ids(cls, user_id: int, ids: list[int]):
        rs = cls._model.objects.filter(user__id=user_id, id__in=ids).all()
        return rs

    @classmethod
    def get_user_todo_items(cls, user_id: int) -> QuerySet["TodoItem"]:
        rs = cls._model.objects.filter(user__id=user_id).all()
        print(rs, user_id)
        return rs

    @classmethod
    def filter_by_due_date_range(cls, start_date, end_date) -> QuerySet["TodoItem"]:
        return cls._model.objects.filter(due_date__range=(start_date, end_date)).all()

    @classmethod
    def get_by_id(cls, todo_id: int) -> "TodoItem":
        try:
            return cls._model.objects.get(id=todo_id)
        except cls._model.DoesNotExist:
            raise cls.DoesNotExist("TodoItem with given ID does not exist")

    @classmethod
    def filter(cls, **filters) -> QuerySet["TodoItem"]:
        return cls._model.objects.filter(**filters).all()


class AsyncTodoItemRepository(TodoItemRepository):
    @classmethod
    async def aget_by_id_and_user(cls, todo_id: int, user_id: int) -> "TodoItem":
        try:
            return await cls._model.objects.aget(id=todo_id, user__id=user_id)
        except cls._model.DoesNotExist:
            raise cls.DoesNotExist("TodoItem with given ID and User does not exist")

    @classmethod
    async def aget_user_todo_items(cls, user_id: int) -> QuerySet["TodoItem"]:
        return await sync_to_async(lambda: list(cls.get_user_todo_items(user_id)))()

    @classmethod
    async def acreate(cls, **kwargs) -> "TodoItem":
        todo_item = cls._model(**kwargs)
        await todo_item.asave()
        return todo_item

    @classmethod
    async def asend_to_archive(cls, todo_id: int, user_id: int) -> None:
        try:
            todo_item = await cls._model.objects.aget(id=todo_id, user__id=user_id)
            todo_item.is_archived = True
            await todo_item.asave(update_fields=["is_archived"])
        except cls._model.DoesNotExist:
            raise cls.DoesNotExist("TodoItem with given ID does not exist")

    @classmethod
    async def adelete_by_id(cls, todo_id: int, user_id: int) -> None:
        try:
            todo_item = await cls._model.objects.aget(id=todo_id, user__id=user_id)
            await todo_item.adelete()
        except cls._model.DoesNotExist:
            raise cls.DoesNotExist("TodoItem with given ID does not exist")
