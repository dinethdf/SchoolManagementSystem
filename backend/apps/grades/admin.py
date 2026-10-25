# apps/grades/admin.py
# Register Assessment and GradeRecord models with the Django administrative interface.

from django.contrib import admin
from .models import Assessment, GradeRecord


@admin.register(Assessment)
class AssessmentAdmin(admin.ModelAdmin):
    """
    Admin interface configuration for the Assessment model.
    Allows administrators to view, add, and manage exams, quizzes, and assignments.
    """

    list_display = (
        'id',
        'name',
        'assessment_type',
        'subject',
        'school_class',
        'max_marks',
        'assessment_date',
        'academic_year',
        'created_by',
    )

    list_filter = (
        'assessment_type',
        'school_class',
        'subject',
        'academic_year',
    )

    search_fields = (
        'name',
        'subject__name',
        'school_class__name',
    )

    ordering = ('-assessment_date',)
    readonly_fields = ('created_at', 'updated_at')


@admin.register(GradeRecord)
class GradeRecordAdmin(admin.ModelAdmin):
    """
    Admin interface configuration for the GradeRecord model.
    Allows administrators to view and manage marks scored by students.
    """

    list_display = (
        'id',
        'assessment',
        'student',
        'marks_obtained',
        'letter_grade',
        'marked_by',
        'created_at',
    )

    list_filter = (
        'letter_grade',
        'assessment__assessment_type',
        'assessment__school_class',
        'assessment__subject',
    )

    search_fields = (
        'student__user__username',
        'student__user__first_name',
        'student__user__last_name',
        'student__admission_number',
        'assessment__name',
    )

    ordering = ('-assessment__assessment_date', 'student')
    readonly_fields = ('letter_grade', 'created_at', 'updated_at')
