# apps/demo/apps.py
# This file configures the demo app within Django.

from django.apps import AppConfig


class DemoConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.demo'
    verbose_name = 'Backend Learning Samples & Demos'
