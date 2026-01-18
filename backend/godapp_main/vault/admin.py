from django.contrib import admin

from vault.models import VaultEntry


# Register your models here.
@admin.register(VaultEntry)
class VaultEntryAdmin(admin.ModelAdmin):
    list_display = ("name", "type", "created_at", "updated_at")
    search_fields = ("name", "type")
    list_filter = ("type", "created_at", "updated_at")
    ordering = ("-created_at",)
