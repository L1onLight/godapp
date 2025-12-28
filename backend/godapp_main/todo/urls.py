from core.urls import ninja_api
from django.urls import path

from todo import views
from todo.api.views import todo_router

ninja_api.add_router("/todo/", todo_router)
urlpatterns = [
    path("todo/dummy/", views.dummy_view, name="todo-dummy"),
]
