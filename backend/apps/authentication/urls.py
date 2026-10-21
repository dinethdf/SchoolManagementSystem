# apps/authentication/urls.py
# URL routing configuration for the Authentication app.
# All routes defined here are prefixed with /api/auth/ in schoolms/urls.py.

from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from . import views

urlpatterns = [
    # POST /api/auth/register/ — Register a new account
    path('register/', views.RegisterView.as_view(), name='auth-register'),

    # POST /api/auth/login/ — Log in with username & password to receive JWT tokens
    path('login/', views.LoginView.as_view(), name='auth-login'),

    # POST /api/auth/token/refresh/ — Obtain a new access token using a valid refresh token
    path('token/refresh/', TokenRefreshView.as_view(), name='token-refresh'),

    # GET /api/auth/me/ — Fetch current user profile
    # PATCH /api/auth/me/ — Update current user profile
    path('me/', views.GetCurrentUserView.as_view(), name='auth-me'),
]
