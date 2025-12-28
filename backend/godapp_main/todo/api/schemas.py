from ninja import ModelSchema

from todo.models import TodoItem


class TodoCreateSchema(ModelSchema):
    def save(self, user_id: int) -> TodoItem:
        todo_item = TodoItem(
            title=self.title,
            due_date=self.due_date,
            is_completed=self.is_completed,
            user_id=user_id,
        )
        todo_item.save()
        return todo_item

    class Meta:
        model = TodoItem
        fields = ["title", "due_date", "is_completed", "column", "column_order"]
        exclude_fields = ["user_id"]


class TodoListSchema(ModelSchema):
    class Meta:
        model = TodoItem
        fields = [
            "id",
            "title",
            "due_date",
            "is_completed",
            "column",
            "column_order",
            "created_at",
        ]
