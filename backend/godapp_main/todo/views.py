from django.http import JsonResponse

from todo.tasks import schedule_upcoming_window


def dummy_view(_request):
    """Return a simple dummy payload for health checks or tests."""
    schedule_upcoming_window.delay()
    return JsonResponse({"status": "ok", "service": "todo"})
