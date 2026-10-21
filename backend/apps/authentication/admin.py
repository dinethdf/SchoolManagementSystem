# apps/authentication/admin.py
# Registers our CustomUser model with the Django administrative interface.

from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser


@admin.register(CustomUser)
class CustomUserAdmin(UserAdmin):
    """
    Custom admin configuration for CustomUser model.
    Extends Django's standard UserAdmin to include custom fields like 'role' and 'phone_number'.
    """

    # Columns displayed in the user list view
    list_display = (
        'username',
        'email',
        'first_name',
        'last_name',
        'role',
        'is_staff',
        'is_active',
        'created_at',
    )

    # Filter sidebar options
    list_filter = (
        'role',
        'is_staff',
        'is_superuser',
        'is_active',
        'created_at',
    )

    # Search bar fields
    search_fields = (
        'username',
        'first_name',
        'last_name',
        'email',
        'phone_number',
    )

    # Ordering
    ordering = ('-created_at',)

    # Form field layout when editing an existing user
    fieldsets = UserAdmin.fieldsets + (
        (
            'School Information',
            {
                'fields': (
                    'role',
                    'phone_number',
                    'address',
                    'date_of_birth',
                    'profile_picture',
                )
            },
        ),
    )

    # Form field layout when creating a new user through the admin
    add_fieldsets = UserAdmin.add_fieldsets + (
        (
            'School Information',
            {
                'fields': (
                    'role',
                    'first_name',
                    'last_name',
                    'email',
                    'phone_number',
                )
            },
        ),
    )
