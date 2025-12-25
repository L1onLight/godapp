from base_utils.widgets import EncryptedCharFieldWidget
from django.contrib import admin
from django.template.response import TemplateResponse
from django.urls import path, reverse

from notificator.channels import NotificatorService

from ..models import NotificationChannel, NotificatorSettings, TelegramChannel


@admin.register(NotificationChannel)
class NotificationChannelAdmin(admin.ModelAdmin):
    list_display = ("name", "polymorphic_ctype")
    search_fields = ("name",)


class EncryptedFieldMapperMixin:
    encrypted_field_mapping = {}

    def formfield_for_dbfield(self, db_field, request, **kwargs):
        formfield = super().formfield_for_dbfield(db_field, request, **kwargs)
        for field_name, widget_class in self.encrypted_field_mapping.items():
            if db_field.name == field_name:
                widget = widget_class()
                widget.request = request
                formfield.widget = widget
        return formfield


@admin.register(TelegramChannel)
class TelegramChannelAdmin(EncryptedFieldMapperMixin, admin.ModelAdmin):
    list_display = ("name", "chat_id", "display_bot_token")
    search_fields = ("name", "chat_id")
    encrypted_field_mapping = {"bot_token": EncryptedCharFieldWidget}
    change_form_template = "admin/notificator/telegramchannel/change_form.html"

    def changeform_view(self, request, object_id=None, form_url="", extra_context=None):
        extra_context = extra_context or {}
        try:
            test_url = reverse("admin:test-telegram-communication")
        except Exception:
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
                NotificatorService.notify(
                    channel=TelegramChannel.objects.get(id=channel_id), message=message
                )
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

    @admin.display(description="Bot Token")
    def display_bot_token(self, obj):
        if obj and obj.bot_token:
            user = getattr(self, "request", None) and getattr(
                self.request, "user", None
            )
            if user and user.has_perm("base_utils.view_encrypted_field"):
                return obj.bot_token
            else:
                return "**********"


@admin.register(NotificatorSettings)
class NotificatorSettingsAdmin(admin.ModelAdmin):
    list_display = ("user",)
    search_fields = ("user__username", "user__email")
