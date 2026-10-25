# apps/attendance/permissions.py
# Custom permission classes to control who can access attendance data.
# These classes are reused across both the attendance and grades apps.

from rest_framework.permissions import BasePermission


class IsTeacherOrAdmin(BasePermission):
    """
    Allows access only to users with the 'teacher' or 'admin' role.
    Used for endpoints that mark or view class-wide attendance data.
    """

    def has_permission(self, request, view):
        # First, make sure the user is logged in
        if not request.user or not request.user.is_authenticated:
            return False

        # Allow access if the user is a teacher, admin, or Django superuser/staff
        allowed_roles = ['admin', 'teacher']
        return request.user.role in allowed_roles or request.user.is_staff or request.user.is_superuser


class IsStudent(BasePermission):
    """
    Allows access only to users with the 'student' role.
    Used for endpoints where students view their own attendance.
    """

    def has_permission(self, request, view):
        # First, make sure the user is logged in
        if not request.user or not request.user.is_authenticated:
            return False

        # Allow access only if the role is 'student'
        return request.user.role == 'student'


class IsParent(BasePermission):
    """
    Allows access only to users with the 'parent' role.
    Used for endpoints where parents view their children's attendance.
    """

    def has_permission(self, request, view):
        # First, make sure the user is logged in
        if not request.user or not request.user.is_authenticated:
            return False

        # Allow access only if the role is 'parent'
        return request.user.role == 'parent'


class IsStudentOrParent(BasePermission):
    """
    Allows access to both students and parents.
    Used when an endpoint serves data for both roles.
    """

    def has_permission(self, request, view):
        # First, make sure the user is logged in
        if not request.user or not request.user.is_authenticated:
            return False

        # Allow access if the user is a student or a parent
        allowed_roles = ['student', 'parent']
        return request.user.role in allowed_roles
