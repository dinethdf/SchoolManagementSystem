# apps/attendance/admin.py
# Register the Attendance model with the Django administrative interface.

from django.contrib import admin
from .models import Attendance


@admin.register(Attendance)
class AttendanceAdmin(admin.ModelAdmin):
    """
    Admin interface configuration for the Attendance model.
    Allows administrators to view, filter, and search attendance records.
    """

    # Columns shown in the main table list view
    list_display = (
        'id',
        'student',
        'school_class',
        'date',
        'status',
        'subject',
        'marked_by',
        'created_at',
    )

    # Filter sidebar options
    list_filter = (
        'status',
        'date',
        'school_class',
        'subject',
    )

    # Search bar options
    search_fields = (
        'student__user__username',
        'student__user__first_name',
        'student__user__last_name',
        'student__admission_number',
        'school_class__name',
        'remarks',
    )

    # Default ordering in admin
    ordering = ('-date', 'student')

    # Read-only timestamp fields
    readonly_fields = ('created_at', 'updated_at')
