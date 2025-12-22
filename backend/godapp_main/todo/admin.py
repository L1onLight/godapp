from django.contrib import admin

from todo.models import TodoItem

# Register your models here.

@admin.register(TodoItem)
class TodoItemAdmin(admin.ModelAdmin):
    list_display = ('title', 'completed')
    list_filter = ('completed',)
    search_fields = ('title',)