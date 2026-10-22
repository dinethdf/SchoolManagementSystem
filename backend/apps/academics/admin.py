# apps/academics/admin.py
# Registers SchoolClass and Subject models with the Django Admin portal.

from django.contrib import admin
from .models import SchoolClass, Subject


class SubjectInline(admin.TabularInline):
    """Allows administrators to view and add subjects directly on the Class edit page."""
    model = Subject
    extra = 1
    fields = ('name', 'code', 'teacher', 'periods_per_week')


@admin.register(SchoolClass)
class SchoolClassAdmin(admin.ModelAdmin):
    """Admin configuration for SchoolClass model."""
    list_display = (
        'name',
        'grade_level',
        'section',
        'academic_year',
        'class_teacher',
        'room_number',
        'created_at'
    )
    list_filter = ('academic_year', 'grade_level', 'section')
    search_fields = ('name', 'academic_year', 'room_number', 'class_teacher__username', 'class_teacher__first_name')
    ordering = ('grade_level', 'section')
    inlines = [SubjectInline]


@admin.register(Subject)
class SubjectAdmin(admin.ModelAdmin):
    """Admin configuration for Subject model."""
    list_display = (
        'name',
        'code',
        'school_class',
        'teacher',
        'periods_per_week',
        'created_at'
    )
    list_filter = ('school_class__academic_year', 'school_class__grade_level')
    search_fields = ('name', 'code', 'school_class__name', 'teacher__username', 'teacher__first_name')
    ordering = ('school_class', 'name')
