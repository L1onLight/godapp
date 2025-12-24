from django.contrib.admin.widgets import AdminSplitDateTime
from django.forms.widgets import TextInput

from base_utils.security import CipherManager


class EncryptedCharFieldWidget(TextInput):
    """TextInput that hides encrypted values unless the user has permission."""

    def format_value(self, value):
        if value in (None, ""):
            return ""

        user = getattr(self, "request", None) and getattr(self.request, "user", None)
        if user and user.has_perm("base_utils.view_encrypted_field"):
            if CipherManager.is_encrypted(str(value)):
                try:
                    return CipherManager.decrypt(value)
                except Exception:
                    return value
            return value

        return value


class QuickSetDateTimeWidget(AdminSplitDateTime):
    """AdminSplitDateTime with quick-set buttons for common time intervals."""

    QUICK_SET_BUTTONS = [
        ("15", "15 mins"),
        ("60", "60 mins"),
        ("next_day", "Next day 18:00"),
    ]

    template_name = "admin/widgets/quick_set_datetime.html"

    def get_context(self, name, value, attrs):
        context = super().get_context(name, value, attrs)
        context["quick_set_buttons"] = self.QUICK_SET_BUTTONS
        return context

    class Media:
        js = ("admin/js/quick_set_datetime.js",)
        css = {"all": ("admin/css/quick_set_datetime.css",)}
