# apps/academics/apps.py
# This file configures the academics app in Django.
# The academics app handles school classes, grade levels, sections, and subjects.

from django.apps import AppConfig


class AcademicsConfig(AppConfig):
    # Default primary key field type for auto-increment IDs
    default_auto_field = 'django.db.models.BigAutoField'

    # The full Python import path to this app
    name = 'apps.academics'

    # The descriptive title shown in the Django Admin interface
    verbose_name = 'Academics (Classes & Subjects)'
