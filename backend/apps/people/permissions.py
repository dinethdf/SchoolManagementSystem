# apps/people/permissions.py
# Permission classes governing access to Student, Teacher, and Parent records.

from rest_framework.permissions import BasePermission


class IsSchoolAdmin(BasePermission):
    """Allows access only to School Administrators and Django superusers."""

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return request.user.role == 'admin' or request.user.is_staff or request.user.is_superuser


class IsTeacherOrAdmin(BasePermission):
    """Allows access to School Administrators and Teachers."""

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return request.user.role in ['admin', 'teacher'] or request.user.is_staff or request.user.is_superuser


class CanViewStudentProfile(BasePermission):
    """
    Object-level permission for accessing a specific student profile:
    - Admins: Can view all students.
    - Teachers: Can view all students.
    - Students: Can view ONLY their own profile.
    - Parents: Can view ONLY their registered children's profiles.
    """

    def has_object_permission(self, request, view, student_profile):
        if not request.user or not request.user.is_authenticated:
            return False

        # Admins and teachers have full view access
        if request.user.role in ['admin', 'teacher'] or request.user.is_staff or request.user.is_superuser:
            return True

        # Students can view their own profile only
        if request.user.role == 'student':
            return student_profile.user == request.user

        # Parents can view if the student is listed in their children
        if request.user.role == 'parent':
            try:
                parent_profile = request.user.parent_profile
                return parent_profile.children.filter(id=student_profile.id).exists()
            except Exception:
                return False

        return False
