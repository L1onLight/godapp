from django.contrib import admin
from django.template.response import TemplateResponse
from django.urls import path, reverse

from ..models import NotificationChannel, TelegramChannel


@admin.register(NotificationChannel)
class NotificationChannelAdmin(admin.ModelAdmin):
    list_display = ("name", "polymorphic_ctype")
    search_fields = ("name",)


@admin.register(TelegramChannel)
class TelegramChannelAdmin(admin.ModelAdmin):
    list_display = ("name", "chat_id", "bot_token")
    search_fields = ("name", "chat_id")

    # Use a custom change form to inject a "Test Channel" button near history
    change_form_template = "admin/notificator/telegramchannel/change_form.html"

    def changeform_view(self, request, object_id=None, form_url="", extra_context=None):
        extra_context = extra_context or {}
        # Build URL to the custom test communication view within admin namespace
        try:
            test_url = reverse("admin:test-telegram-communication")
        except Exception:
            # Fallback: construct with app/model prefix if named that way in future
            test_url = reverse(
                f"admin:{self.model._meta.app_label}_{self.model._meta.model_name}_test-telegram-communication"
            )
        extra_context["test_comm_url"] = test_url
        return super().changeform_view(request, object_id, form_url, extra_context)

    def test_communication_view(self, request):
        if request.method == "POST":
            channel_id = request.POST.get("channel_id")
            message = request.POST.get("message")
            try:
                channel = TelegramChannel.objects.get(id=channel_id)
                channel.communicate(message)
                self.message_user(request, "Message sent successfully.")
            except TelegramChannel.DoesNotExist:
                self.message_user(request, "Channel does not exist.", level="error")
        context = dict(
            self.admin_site.each_context(request),
            channels=TelegramChannel.objects.all(),
        )
        return TemplateResponse(request, "admin/test_telegram_channel.html", context)

    def get_urls(self):
        return [
            path(
                "test-communication/",
                self.admin_site.admin_view(self.test_communication_view),
                name="test-telegram-communication",
            ),
        ] + super().get_urls()
