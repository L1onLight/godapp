import base64

from django.contrib.auth import get_user_model
from django.test import TestCase
from ninja.testing import TestAsyncClient

from todo.repository import TodoItemRepository
from todo.urls import todo_router


class TestTodoAPI(TestCase):
    def setUp(self):
        self.user = get_user_model().objects.create_user(
            username="testuser", password="password"
        )
        self.client = TestAsyncClient(
            todo_router,
        )
        self.auth_client = TestAsyncClient(
            todo_router,
            headers={
                "Authorization": f"Basic {base64.b64encode(b'testuser:password').decode()}"
            },
        )

        self.todo = TodoItemRepository._model.objects.create(
            title="Test Todo",
            due_date=None,
            is_completed=False,
            user=self.user,
        )

    async def test_unauthorized(self):
        response = await self.client.get("/")
        assert response.status_code == 401

    async def test_list_todo_items(self):
        response = await self.auth_client.get("/")
        assert response.status_code == 200
        assert len(response.json()) == 1
        assert response.json()[0]["title"] == "Test Todo"

    async def test_retrieve_todo_item(self):
        response = await self.auth_client.get(f"/{self.todo.id}/")
        assert response.status_code == 200
        assert response.json()["result"]["title"] == "Test Todo"

    async def test_create_todo_item(self):
        payload = {
            "title": "New Todo",
            "due_date": None,
            "is_completed": False,
        }
        response = await self.auth_client.post("/", json=payload)
        assert response.status_code == 200
        assert response.json()["result"]["title"] == "New Todo"

    async def test_update_todo_item(self):
        payload = {
            "title": "Updated Todo",
            "due_date": None,
            "is_completed": True,
        }
        response = await self.auth_client.put(f"/{self.todo.id}/", json=payload)
        assert response.status_code == 200
        assert response.json()["result"]["title"] == "Updated Todo"
        assert response.json()["result"]["is_completed"] is True
