from base_utils.widgets import QuickSetDateTimeWidget
from django import forms
from django.contrib import admin

from todo.models import TodoItem


class TodoItemAdminForm(forms.ModelForm):
    due_date = forms.SplitDateTimeField(
        required=False,
        widget=QuickSetDateTimeWidget(),
    )

    class Meta:
        model = TodoItem
        fields = "__all__"


@admin.register(TodoItem)
class TodoItemAdmin(admin.ModelAdmin):
    form = TodoItemAdminForm
    list_display = (
        "title",
        "is_completed",
        "due_date",
        "column",
        "column_order",
        "user",
    )
    list_filter = ("is_completed", "column", "due_date")
    search_fields = ("title",)
