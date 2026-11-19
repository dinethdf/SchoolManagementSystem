# apps/assignments/permissions.py
# Custom permission classes to control who can view, create, submit, and grade assignments.

from rest_framework.permissions import BasePermission


class IsTeacherOrAdmin(BasePermission):
    """
    Allows access only to authenticated users with the 'teacher' or 'admin' role.
    Used for endpoints that create assignments, view submissions, and grade work.
    """

    def has_permission(self, request, view):
        # User must be logged in
        if not request.user or not request.user.is_authenticated:
            return False

        # Allow access if user is teacher, admin, or Django superuser/staff
        allowed_roles = ['admin', 'teacher']
        return (
            request.user.role in allowed_roles
            or request.user.is_staff
            or request.user.is_superuser
        )


class IsStudent(BasePermission):
    """
    Allows access only to users with the 'student' role.
    Used for endpoints where students view and turn in homework.
    """

    def has_permission(self, request, view):
        # User must be logged in
        if not request.user or not request.user.is_authenticated:
            return False

        # Allow access only if role is 'student'
        return request.user.role == 'student'


class IsParent(BasePermission):
    """
    Allows access only to users with the 'parent' role.
    Used for endpoints where parents track their children's homework progress.
    """

    def has_permission(self, request, view):
        # User must be logged in
        if not request.user or not request.user.is_authenticated:
            return False

        # Allow access only if role is 'parent'
        return request.user.role == 'parent'
