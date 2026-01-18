from django.contrib import admin

from base_utils.models import SystemUser, Tag


@admin.register(Tag)
class TagAdmin(admin.ModelAdmin):
    list_display = ("name", "created_at")
    search_fields = ("name",)
    ordering = ("name",)


@admin.register(SystemUser)
class SystemUserAdmin(admin.ModelAdmin):
    list_display = ("username", "email", "is_active")
    search_fields = ("username", "email")
    ordering = ("username",)
