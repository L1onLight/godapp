from django.db.models import QuerySet

from todo.models import TodoItem


class TodoItemRepository:
    class DoesNotExist(Exception):
        pass

    @classmethod
    def get_user_todo_items(cls, user_id: int) -> QuerySet["TodoItem"]:
        return TodoItem.objects.filter(user__id=user_id).all()

    @classmethod
    def filter_by_due_date_range(cls, start_date, end_date) -> QuerySet["TodoItem"]:
        return TodoItem.objects.filter(due_date__range=(start_date, end_date)).all()

    @classmethod
    def get_by_id(cls, todo_id: int) -> "TodoItem":
        try:
            return TodoItem.objects.get(id=todo_id)
        except TodoItem.DoesNotExist:
            raise cls.DoesNotExist("TodoItem with given ID does not exist")
