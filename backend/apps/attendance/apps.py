# apps/attendance/apps.py
# This file tells Django about the attendance application and its configuration.

from django.apps import AppConfig


class AttendanceConfig(AppConfig):
    """
    Configuration class for the attendance Django application.
    Django reads this class to register the app properly.
    """

    # Tells Django to use BigAutoField as the default primary key type
    default_auto_field = 'django.db.models.BigAutoField'

    # The full Python path to this app — must match INSTALLED_APPS entry
    name = 'apps.attendance'

    # A human-readable label shown in Django admin
    verbose_name = 'Attendance Management'
