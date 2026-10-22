# apps/people/admin.py
# Registers StudentProfile, TeacherProfile, and ParentProfile models in the Django Admin.

from django.contrib import admin
from .models import StudentProfile, TeacherProfile, ParentProfile


@admin.register(StudentProfile)
class StudentProfileAdmin(admin.ModelAdmin):
    list_display = (
        'admission_number',
        'get_full_name',
        'enrolled_class',
        'roll_number',
        'admission_date',
        'blood_group',
        'created_at'
    )
    list_filter = ('enrolled_class__academic_year', 'enrolled_class__grade_level', 'enrolled_class', 'blood_group')
    search_fields = (
        'admission_number',
        'user__first_name',
        'user__last_name',
        'user__username',
        'emergency_contact_name',
        'emergency_contact_phone'
    )
    ordering = ('admission_number',)

    def get_full_name(self, obj):
        return obj.user.get_full_name() or obj.user.username
    get_full_name.short_description = 'Student Name'


@admin.register(TeacherProfile)
class TeacherProfileAdmin(admin.ModelAdmin):
    list_display = (
        'employee_id',
        'get_full_name',
        'department',
        'qualification',
        'joining_date',
        'created_at'
    )
    list_filter = ('department', 'joining_date')
    search_fields = ('employee_id', 'user__first_name', 'user__last_name', 'user__username', 'department')
    ordering = ('employee_id',)

    def get_full_name(self, obj):
        return obj.user.get_full_name() or obj.user.username
    get_full_name.short_description = 'Teacher Name'


@admin.register(ParentProfile)
class ParentProfileAdmin(admin.ModelAdmin):
    list_display = (
        'get_full_name',
        'occupation',
        'relationship_to_child',
        'get_children_count',
        'created_at'
    )
    search_fields = ('user__first_name', 'user__last_name', 'user__username', 'occupation')
    filter_horizontal = ('children',)

    def get_full_name(self, obj):
        return obj.user.get_full_name() or obj.user.username
    get_full_name.short_description = 'Parent Name'

    def get_children_count(self, obj):
        return obj.children.count()
    get_children_count.short_description = 'Registered Children'
