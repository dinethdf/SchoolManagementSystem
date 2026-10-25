"""
schoolms URL Configuration

The `urlpatterns` list routes URLs to views.
Routes in this project:
- /admin/         -> Django administrative dashboard
- /api/auth/      -> Authentication and user accounts (register, login, refresh, me)
- /api/health/    -> Simple backend health check to verify API status
"""

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny


class BackendHealthCheckView(APIView):
    """
    Simple health check view to verify that the backend server is running correctly.
    Endpoint: GET /api/health/
    """
    permission_classes = [AllowAny]

    def get(self, request):
        return Response({
            'status': 'healthy',
            'system': 'School Management System API',
            'version': '1.0.0',
            'database': 'MySQL',
        })


urlpatterns = [
    # Built-in Django Admin Interface
    path('admin/', admin.site.urls),

    # Backend Health Check
    path('api/health/', BackendHealthCheckView.as_view(), name='api-health-check'),

    # Authentication App Endpoints (login, register, token refresh, current user profile)
    path('api/auth/', include('apps.authentication.urls')),

    # Academics App Endpoints (classes, subjects, and schedules)
    path('api/academics/', include('apps.academics.urls')),

    # People App Endpoints (student profiles, teacher profiles, parent profiles)
    path('api/people/', include('apps.people.urls')),

    # Attendance App Endpoints (class-level marking, student history & summaries)
    path('api/attendance/', include('apps.attendance.urls')),

    # Grades App Endpoints (assessments, bulk mark entry, report cards)
    path('api/grades/', include('apps.grades.urls')),

    # Learning Demo Endpoints (standalone logic demos, no database required)
    path('api/demo/', include('apps.demo.urls')),
]

# In development mode, serve user-uploaded media files (profile pictures, attachments)
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
