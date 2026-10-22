# apps/academics/permissions.py
# Custom permission classes to restrict access based on user roles (Admin, Teacher, Student).

from rest_framework.permissions import BasePermission, SAFE_METHODS


class IsSchoolAdmin(BasePermission):
    """
    Allows access only to users who have the 'admin' role, or are staff/superusers.
    Used for creating, updating, or deleting classes and subjects.
    """

    def has_permission(self, request, view):
        # Must be logged in
        if not request.user or not request.user.is_authenticated:
            return False

        # Allow if role is admin or if Django staff/superuser
        return request.user.role == 'admin' or request.user.is_staff or request.user.is_superuser


class IsTeacherOrAdmin(BasePermission):
    """
    Allows access to both Teachers and Admins.
    Useful for viewing class schedules, student lists, and syllabus information.
    """

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False

        allowed_roles = ['admin', 'teacher']
        return request.user.role in allowed_roles or request.user.is_staff or request.user.is_superuser


class IsAdminOrReadOnly(BasePermission):
    """
    Safe methods (GET, HEAD, OPTIONS) are allowed for any authenticated user (e.g. teachers/students).
    Write methods (POST, PUT, PATCH, DELETE) are strictly restricted to Admins.
    """

    def has_permission(self, request, view):
        # Must be authenticated to access academics at all
        if not request.user or not request.user.is_authenticated:
            return False

        # If it's a read request (GET), allow it
        if request.method in SAFE_METHODS:
            return True

        # If it's a write request (POST/PUT/DELETE), only admins can proceed
        return request.user.role == 'admin' or request.user.is_staff or request.user.is_superuser
