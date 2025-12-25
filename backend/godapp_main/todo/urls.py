from django.urls import path

from todo import views

urlpatterns = [
    path("dummy/", views.dummy_view, name="todo-dummy"),
]
