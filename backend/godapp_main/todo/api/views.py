from base_utils.security import JWTAuth
from django.http import Http404
from ninja import Router

from todo.api.schemas import (
    ReorderItemSchema,
    TodoCreateSchema,
    TodoListSchema,
    TodoUpdateSchema,
)
from todo.repository import AsyncTodoItemRepository, TodoItemRepository

todo_router = Router(auth=[JWTAuth(csrf=False)], tags=["Todo"])


@todo_router.get("/", response=list[TodoListSchema])
async def list_(request) -> list[TodoListSchema]:
    todo_items = await AsyncTodoItemRepository.aget_user_todo_items(request.user.id)
    return [TodoListSchema.from_orm(item) for item in todo_items]


@todo_router.post("/", response=TodoListSchema)
async def create(request, payload: TodoCreateSchema):
    todo = payload.save(request.user.id)
    return TodoListSchema.from_orm(todo)


@todo_router.post("/reorder/")
def reorder(request, orders: list[ReorderItemSchema]):
    todos = TodoItemRepository.get_todo_by_ids(
        user_id=request.user.id, ids=[o.id for o in orders]
    )
    for order in orders:
        for todo in todos:
            if todo.id == order.id:
                todo.column = order.column
                todo.column_order = order.column_order
            else:
                continue
    todos.bulk_update(todos, ["column", "column_order"])

    return {"result": "Todo items reordered successfully"}


@todo_router.put("/{todo_id}/", response=TodoListSchema)
async def update(request, todo_id: int, payload: TodoUpdateSchema):
    try:
        todo = await AsyncTodoItemRepository.aget_by_id_and_user(
            todo_id, request.user.id
        )
        fields_to_update = []
        if payload.title and todo.title != payload.title:
            print(f"Updating title from {todo.title} to {payload.title}")
            todo.title = payload.title
            fields_to_update.append("title")
        if payload.description and todo.description != payload.description:
            todo.description = payload.description
            fields_to_update.append("description")
        if payload.due_date and todo.due_date != payload.due_date:
            todo.due_date = payload.due_date
            fields_to_update.append("due_date")
        if payload.is_completed and todo.is_completed != payload.is_completed:
            todo.is_completed = payload.is_completed
            fields_to_update.append("is_completed")
        if payload.column and todo.column != payload.column:
            todo.column = payload.column
            fields_to_update.append("column")
        if payload.column_order and todo.column_order != payload.column_order:
            todo.column_order = payload.column_order
            fields_to_update.append("column_order")
        if not fields_to_update:
            return TodoListSchema.from_orm(todo)
        await todo.asave(update_fields=fields_to_update)
        return TodoListSchema.from_orm(todo)
    except TodoItemRepository.DoesNotExist:
        return {"error": "Todo item not found"}, 404


@todo_router.get("/{todo_id}/", response=TodoListSchema)
async def retrieve(request, todo_id: int):
    try:
        todo = await AsyncTodoItemRepository.aget_by_id_and_user(
            todo_id, request.user.id
        )
        return TodoListSchema.from_orm(todo)
    except TodoItemRepository.DoesNotExist:
        raise Http404("Todo item not found")


@todo_router.delete("/{todo_id}/")
async def archive(request, todo_id: int):
    try:
        await AsyncTodoItemRepository.asend_to_archive(todo_id, request.user.id)
        return {"result": "Todo item archived successfully"}
    except AsyncTodoItemRepository.DoesNotExist:
        return {"error": "Todo item not found"}


@todo_router.delete("/{todo_id}/delete/")
async def delete(request, todo_id: int):
    try:
        await AsyncTodoItemRepository.adelete_by_id(todo_id, request.user.id)
        return {"result": "Todo item deleted successfully"}
    except AsyncTodoItemRepository.DoesNotExist:
        return {"error": "Todo item not found"}
