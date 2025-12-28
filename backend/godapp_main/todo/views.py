from django.http import JsonResponse

from todo.models import TodoItem


def dummy_view(_request):
    """Return a simple dummy payload for health checks or tests."""
    todo_item = TodoItem.objects.first()
    todo_item.save()
    return JsonResponse({"status": "ok", "service": "todo"})
