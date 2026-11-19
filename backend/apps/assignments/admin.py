# apps/assignments/admin.py
# This file registers the Assignment and Submission models in the Django Admin interface.

from django.contrib import admin
from .models import Assignment, Submission


@admin.register(Assignment)
class AssignmentAdmin(admin.ModelAdmin):
    """
    Django Admin panel configuration for the Assignment model.
    Allows administrators to view, search, and manage homework items.
    """

    # Columns shown in the admin table list view
    list_display = [
        'title',
        'subject',
        'school_class',
        'assignment_type',
        'max_marks',
        'due_date',
        'is_active',
        'assigned_by',
    ]

    # Filters displayed on the right sidebar
    list_filter = [
        'assignment_type',
        'is_active',
        'school_class',
        'subject',
        'due_date',
    ]

    # Search bar fields
    search_fields = [
        'title',
        'description',
        'subject__name',
        'school_class__name',
    ]


@admin.register(Submission)
class SubmissionAdmin(admin.ModelAdmin):
    """
    Django Admin panel configuration for the Submission model.
    Allows administrators and staff to inspect student homework submissions.
    """

    # Columns shown in the admin table list view
    list_display = [
        'assignment',
        'student',
        'status',
        'marks_obtained',
        'submitted_at',
        'graded_by',
    ]

    # Filters displayed on the right sidebar
    list_filter = [
        'status',
        'assignment__school_class',
        'assignment__subject',
    ]

    # Search bar fields
    search_fields = [
        'student__admission_number',
        'student__user__first_name',
        'student__user__last_name',
        'assignment__title',
    ]
