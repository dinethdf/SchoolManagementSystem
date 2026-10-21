# apps/authentication/apps.py
# This file configures the authentication app within Django.

from django.apps import AppConfig


class AuthenticationConfig(AppConfig):
    # Set the default primary key type for auto-increment IDs
    default_auto_field = 'django.db.models.BigAutoField'

    # The full Python path to this application
    name = 'apps.authentication'

    # The human-readable name shown in Django admin
    verbose_name = 'User Authentication & Accounts'
