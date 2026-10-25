# apps/attendance/urls.py
# URL routing for the Attendance app.
# Each URL pattern maps a URL path to a specific view class.

from django.urls import path
from . import views

# All these URLs are prefixed with /api/attendance/ (set in schoolms/urls.py)
urlpatterns = [
    # Teacher/Admin: Mark attendance for all students in a class at once
    # Example: POST /api/attendance/bulk/
    path('bulk/', views.BulkMarkAttendanceView.as_view(), name='attendance-bulk-mark'),

    # Teacher/Admin: View class attendance for a specific date
    # Example: GET /api/attendance/class/1/?date=2026-10-23
    path('class/<int:class_id>/', views.ClassAttendanceView.as_view(), name='attendance-class-view'),

    # Teacher/Admin: View full attendance history for a specific student
    # Example: GET /api/attendance/student/5/
    path('student/<int:student_id>/', views.StudentAttendanceHistoryView.as_view(), name='attendance-student-history'),

    # Teacher/Admin: View attendance percentage summary for a specific student
    # Example: GET /api/attendance/student/5/summary/
    path('student/<int:student_id>/summary/', views.StudentAttendanceSummaryView.as_view(), name='attendance-student-summary'),

    # Student: View own attendance history
    # Example: GET /api/attendance/my-attendance/
    path('my-attendance/', views.MyAttendanceView.as_view(), name='attendance-my-attendance'),

    # Student: View own attendance percentage summary
    # Example: GET /api/attendance/my-attendance/summary/
    path('my-attendance/summary/', views.MyAttendanceSummaryView.as_view(), name='attendance-my-summary'),

    # Parent: View attendance records for all linked children
    # Example: GET /api/attendance/my-children/
    path('my-children/', views.MyChildrenAttendanceView.as_view(), name='attendance-my-children'),
]
