from base_utils.security import JWTAuth, NinjaBasicAuth
from django.http import Http404
from ninja import Router
from ninja.security import django_auth

from todo.api.schemas import TodoCreateSchema, TodoListSchema
from todo.repository import AsyncTodoItemRepository, TodoItemRepository

todo_router = Router(auth=[django_auth, NinjaBasicAuth(), JWTAuth()], tags=["Todo"])


@todo_router.get("/", response=list[TodoListSchema])
async def list_(request) -> list[TodoListSchema]:
    todo_items = await AsyncTodoItemRepository.aget_user_todo_items(request.user.id)
    print(todo_items)
    return [TodoListSchema.from_orm(item) for item in todo_items]


@todo_router.post("/", response=TodoListSchema)
def create(request, payload: TodoCreateSchema):
    todo = payload.save(request.user.id)
    return {"result": TodoListSchema.from_orm(todo)}


@todo_router.put("/{todo_id}/", response=TodoListSchema)
async def update(request, todo_id: int, payload: TodoCreateSchema):
    try:
        todo = await AsyncTodoItemRepository.aget_by_id_and_user(
            todo_id, request.user.id
        )
        fields_to_update = []
        if todo.title != payload.title:
            fields_to_update.append("title")
        if todo.description != payload.description:
            fields_to_update.append("description")
        if todo.due_date != payload.due_date:
            fields_to_update.append("due_date")
        if todo.is_completed != payload.is_completed:
            fields_to_update.append("is_completed")
        if todo.column != payload.column:
            fields_to_update.append("column")
        if todo.column_order != payload.column_order:
            fields_to_update.append("column_order")
        if not fields_to_update:
            return {"result": TodoListSchema.from_orm(todo)}
        todo.title = payload.title
        todo.description = payload.description
        todo.due_date = payload.due_date
        todo.is_completed = payload.is_completed
        todo.column = payload.column
        todo.column_order = payload.column_order
        await todo.asave(update_fields=fields_to_update)
        return {"result": TodoListSchema.from_orm(todo)}
    except TodoItemRepository.DoesNotExist:
        return {"error": "Todo item not found"}, 404


@todo_router.get("/{todo_id}/", response=TodoListSchema)
async def retrieve(request, todo_id: int):
    try:
        todo = await AsyncTodoItemRepository.aget_by_id_and_user(
            todo_id, request.user.id
        )
        return {"result": TodoListSchema.from_orm(todo)}
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
