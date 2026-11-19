# apps/assignments/apps.py
# This file defines the Django application configuration for the assignments app.

from django.apps import AppConfig


class AssignmentsConfig(AppConfig):
    """
    Configuration class for the assignments Django application.
    Django reads this class to register the app in the project.
    """

    # Default auto field for primary keys
    default_auto_field = 'django.db.models.BigAutoField'

    # The full Python path to this app - must match the entry in INSTALLED_APPS
    name = 'apps.assignments'

    # A clear, friendly label shown in the Django admin panel
    verbose_name = 'Assignments & Homework Management'
