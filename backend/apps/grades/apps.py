# apps/grades/apps.py
# This file tells Django about the grades application and its configuration.

from django.apps import AppConfig


class GradesConfig(AppConfig):
    """
    Configuration class for the grades Django application.
    Django reads this class to register the app properly.
    """

    # Tells Django to use BigAutoField as the default primary key type
    default_auto_field = 'django.db.models.BigAutoField'

    # The full Python path to this app — must match INSTALLED_APPS entry
    name = 'apps.grades'

    # A human-readable label shown in Django admin
    verbose_name = 'Grades & Results Management'
