from django.contrib.auth import get_user_model
from django.db import models
from django.utils.translation import gettext_lazy as _


class VaultItemType(models.TextChoices):
    PASSWORD = "password", "Password"
    TOKEN = "token", "Token"
    SSH_KEY = "ssh_key", "SSH Key"


class VaultEntry(models.Model):
    user = models.ForeignKey(
        get_user_model(),
        on_delete=models.CASCADE,
    )
    name = models.CharField(
        max_length=255, help_text=_("Name or label for this vault entry")
    )
    type = models.CharField(
        choices=VaultItemType.choices,
        max_length=20,
        default=VaultItemType.PASSWORD,
        help_text=_("Type of secret: password, token, or SSH key"),
    )
    tags = models.ManyToManyField(
        "base_utils.Tag",
        blank=True,
        help_text=_("Optional tags to categorize and organize entries"),
    )
    url = models.URLField(
        null=True, blank=True, help_text=_("Optional URL associated with the entry")
    )
    data = models.TextField(
        help_text=_("E2E Encrypted secret data (password, token, or key content)"),
    )

    created_at = models.DateTimeField(
        auto_now_add=True, help_text=_("Timestamp when entry was created")
    )
    updated_at = models.DateTimeField(
        auto_now=True, help_text=_("Timestamp when entry was last updated")
    )

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "Vault Entry"
        verbose_name_plural = "Vault Entries"
