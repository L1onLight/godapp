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
