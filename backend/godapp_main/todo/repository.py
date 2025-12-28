from django.db.models import QuerySet
from loguru import logger as base_logger

from todo.models import TodoItem

logger = base_logger.bind(module="todo.repository")


class TodoItemRepository:
    _model = TodoItem

    class DoesNotExist(Exception):
        pass

    @classmethod
    def get_user_todo_items(cls, user_id: int) -> QuerySet["TodoItem"]:
        return cls._model.objects.filter(user__id=user_id).all()

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
