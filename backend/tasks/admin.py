
from django.contrib import admin
from .models import Task


@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = ('title', 'owner', 'priority', 'due_date', 'completed', 'created_at')
    list_filter = ('completed', 'priority', 'owner')
    search_fields = ('title', 'description', 'owner__username')