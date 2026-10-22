# apps/people/urls.py
# URL routes for the People app (Students, Teachers, Parents).
# All paths here are prefixed with /api/people/ in schoolms/urls.py.

from django.urls import path
from . import views

urlpatterns = [
    # -------------------------------------------------------------------------
    # Student Endpoints
    # -------------------------------------------------------------------------
    # GET /api/people/students/            -> List students (Teachers & Admins)
    # POST /api/people/students/           -> Enroll student (Admin only)
    path('students/', views.StudentListCreateView.as_view(), name='student-list-create'),

    # GET /api/people/students/me/         -> Student views own profile
    path('students/me/', views.StudentMyProfileView.as_view(), name='student-my-profile'),

    # GET /api/people/students/<id>/       -> View student details
    # PATCH /api/people/students/<id>/     -> Update student details (Admin only)
    # DELETE /api/people/students/<id>/    -> Delete student profile (Admin only)
    path('students/<int:student_id>/', views.StudentDetailView.as_view(), name='student-detail'),

    # -------------------------------------------------------------------------
    # Teacher Endpoints
    # -------------------------------------------------------------------------
    # GET /api/people/teachers/            -> List all teachers
    # POST /api/people/teachers/           -> Add teacher profile (Admin only)
    path('teachers/', views.TeacherListCreateView.as_view(), name='teacher-list-create'),

    # GET /api/people/teachers/<id>/       -> View teacher profile
    # PATCH /api/people/teachers/<id>/     -> Update teacher profile (Admin only)
    # DELETE /api/people/teachers/<id>/    -> Delete teacher profile (Admin only)
    path('teachers/<int:teacher_id>/', views.TeacherDetailView.as_view(), name='teacher-detail'),

    # -------------------------------------------------------------------------
    # Parent Endpoints
    # -------------------------------------------------------------------------
    # GET /api/people/parents/             -> List all parents (Admin only)
    # POST /api/people/parents/            -> Create parent profile (Admin only)
    path('parents/', views.ParentListCreateView.as_view(), name='parent-list-create'),

    # GET /api/people/parents/my-children/ -> Parent views their children
    path('parents/my-children/', views.ParentMyChildrenView.as_view(), name='parent-my-children'),

    # GET /api/people/parents/<id>/        -> View parent profile
    # PATCH /api/people/parents/<id>/      -> Update parent profile (Admin only)
    # DELETE /api/people/parents/<id>/     -> Delete parent profile (Admin only)
    path('parents/<int:parent_id>/', views.ParentDetailView.as_view(), name='parent-detail'),
]
