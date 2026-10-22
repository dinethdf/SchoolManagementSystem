"""
Django settings for schoolms (School Management System) project.
Configured for:
- Python 3.11+ / Django 5/6
- MySQL database connection via PyMySQL
- Django REST Framework with Simple JWT Authentication
- CORS headers for React frontend integration
"""

from pathlib import Path
from datetime import timedelta
import os
from decouple import config, Csv

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent


# ==============================================================================
# 1. SECURITY CONFIGURATION
# ==============================================================================

# SECRET_KEY is loaded safely from the .env file instead of being hardcoded
SECRET_KEY = config('SECRET_KEY', default='django-insecure-dev-fallback-key-replace-in-env')

# DEBUG mode: True during development, False in production
DEBUG = config('DEBUG', default=True, cast=bool)

# Hostnames allowed to connect to this server
ALLOWED_HOSTS = config('ALLOWED_HOSTS', default='127.0.0.1,localhost', cast=Csv())


# ==============================================================================
# 2. INSTALLED APPLICATIONS
# ==============================================================================

INSTALLED_APPS = [
    # Standard Django core apps
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    # Third-party packages
    'rest_framework',                  # Django REST Framework for API endpoints
    'rest_framework_simplejwt',        # JWT authentication tokens
    'corsheaders',                     # Handles Cross-Origin Resource Sharing for React

    # Custom project apps
    'apps.authentication.apps.AuthenticationConfig',  # User accounts, roles & auth
    'apps.academics.apps.AcademicsConfig',            # Classes, grade levels, and subjects
    'apps.people.apps.PeopleConfig',                  # Students, teachers, and parent profiles
    'apps.demo.apps.DemoConfig',                      # Learning samples and demos (no DB required)
]


# ==============================================================================
# 3. MIDDLEWARE PIPELINE
# ==============================================================================

MIDDLEWARE = [
    # CorsMiddleware must be at the top to handle browser CORS pre-flight requests
    'corsheaders.middleware.CorsMiddleware',

    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]


# ==============================================================================
# 4. URLS & ROUTING
# ==============================================================================

ROOT_URLCONF = 'schoolms.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'templates'],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'schoolms.wsgi.application'


# ==============================================================================
# 5. DATABASE CONFIGURATION (MySQL by default, configurable via .env)
# ==============================================================================

# Database engine choice: 'mysql' (default for production/development) or 'sqlite3'
DB_ENGINE = config('DB_ENGINE', default='mysql').lower()

DB_NAME = config('DB_NAME', default='school_management_system')
DB_USER = config('DB_USER', default='root')
DB_PASSWORD = config('DB_PASSWORD', default='')
DB_HOST = config('DB_HOST', default='127.0.0.1')
DB_PORT = config('DB_PORT', default='3306')

if DB_ENGINE == 'sqlite3':
    # Lightweight SQLite option for quick offline testing if MySQL service is paused
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': BASE_DIR / 'db.sqlite3',
        }
    }
else:
    # Standard MySQL Database Configuration
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.mysql',
            'NAME': DB_NAME,
            'USER': DB_USER,
            'PASSWORD': DB_PASSWORD,
            'HOST': DB_HOST,
            'PORT': DB_PORT,
            'OPTIONS': {
                'charset': 'utf8mb4',
                'init_command': "SET sql_mode='STRICT_TRANS_TABLES'",
            },
        }
    }


# ==============================================================================
# 6. CUSTOM USER MODEL
# ==============================================================================

# Tell Django to use our CustomUser model inside apps/authentication
# instead of the default built-in User model
AUTH_USER_MODEL = 'authentication.CustomUser'


# ==============================================================================
# 7. PASSWORD VALIDATION
# ==============================================================================

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
        'OPTIONS': {
            'min_length': 8,  # Minimum 8 characters for security
        }
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]


# ==============================================================================
# 8. DJANGO REST FRAMEWORK (DRF) SETTINGS
# ==============================================================================

REST_FRAMEWORK = {
    # Use JSON Web Tokens (JWT) to authenticate incoming API requests
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ],

    # By default, endpoints require the user to be logged in (authenticated)
    # Views that need public access explicitly declare permission_classes = [AllowAny]
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
}


# ==============================================================================
# 9. SIMPLE JWT CONFIGURATION
# ==============================================================================

SIMPLE_JWT = {
    # Access token expires after 15 minutes for security
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=15),

    # Refresh token lasts 7 days so users don't need to log in repeatedly
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),

    # Rotate refresh tokens on refresh
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': False,

    # Custom header type: 'Bearer <token>'
    'AUTH_HEADER_TYPES': ('Bearer',),
}


# ==============================================================================
# 10. CORS (CROSS-ORIGIN RESOURCE SHARING)
# ==============================================================================

# Allows the React frontend (running on Vite, port 5173) to communicate with this backend
CORS_ALLOWED_ORIGINS = config(
    'CORS_ALLOWED_ORIGINS',
    default='http://localhost:5173,http://127.0.0.1:5173',
    cast=Csv()
)

# Allow credentials (cookies/authorization headers)
CORS_ALLOW_CREDENTIALS = True


# ==============================================================================
# 11. INTERNATIONALIZATION & TIMEZONE
# ==============================================================================

LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True


# ==============================================================================
# 12. STATIC & MEDIA FILES
# ==============================================================================

# URL prefix for static files (CSS, JS)
STATIC_URL = 'static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'

# URL prefix and storage directory for user uploaded files (e.g. profile pictures)
MEDIA_URL = 'media/'
MEDIA_ROOT = BASE_DIR / 'media'

# Default primary key field type
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'
