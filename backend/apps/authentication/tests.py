# apps/authentication/tests.py
# Unit and integration tests for the Authentication API endpoints.
# Run tests using: python manage.py test apps.authentication

from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from .models import CustomUser


class AuthenticationAPITests(APITestCase):
    """
    Test suite covering registration, login, and current-user endpoints.
    These tests verify that:
    1. New users can register and get JWT tokens.
    2. Users cannot register if passwords do not match.
    3. Users can log in and receive valid JWT tokens.
    4. Unauthenticated requests to /api/auth/me/ are rejected with 401.
    5. Authenticated requests to /api/auth/me/ return the user profile.
    """

    def setUp(self):
        """
        Runs before each test method.
        Creates common test data and endpoint URLs.
        """
        # Store URLs for each endpoint
        self.register_url = reverse('auth-register')
        self.login_url = reverse('auth-login')
        self.me_url = reverse('auth-me')

        # Create a pre-existing test user in the test database
        self.existing_username = "testteacher"
        self.existing_password = "TeacherSecurePassword123!"
        self.existing_email = "teacher@school.com"

        self.existing_user = CustomUser.objects.create_user(
            username=self.existing_username,
            email=self.existing_email,
            password=self.existing_password,
            first_name="Jane",
            last_name="Doe",
            role=CustomUser.ROLE_TEACHER
        )

    def test_successful_user_registration(self):
        """
        Test that a new student can register with valid details.
        Expected: HTTP 201 Created and response contains JWT tokens and user profile.
        """
        registration_payload = {
            'username': 'newstudent101',
            'email': 'student101@school.com',
            'first_name': 'Alex',
            'last_name': 'Johnson',
            'password': 'StudentSecurePassword123!',
            'confirm_password': 'StudentSecurePassword123!',
            'role': CustomUser.ROLE_STUDENT,
            'phone_number': '0771234567',
        }

        # Send POST request to registration endpoint
        response = self.client.post(self.register_url, registration_payload, format='json')

        # Assert response status code is 201 Created
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        # Assert response contains success flag and tokens
        self.assertTrue(response.data['success'])
        self.assertIn('tokens', response.data)
        self.assertIn('access_token', response.data['tokens'])
        self.assertIn('refresh_token', response.data['tokens'])

        # Assert user was actually created in the database
        created_user_exists = CustomUser.objects.filter(username='newstudent101').exists()
        self.assertTrue(created_user_exists)

    def test_registration_fails_when_passwords_do_not_match(self):
        """
        Test that registration is rejected if password and confirm_password do not match.
        Expected: HTTP 400 Bad Request with clear error message.
        """
        invalid_payload = {
            'username': 'mismatchedstudent',
            'email': 'mismatch@school.com',
            'first_name': 'Sam',
            'last_name': 'Brown',
            'password': 'PasswordOne123!',
            'confirm_password': 'PasswordDifferent456!',
            'role': CustomUser.ROLE_STUDENT,
        }

        response = self.client.post(self.register_url, invalid_payload, format='json')

        # Assert HTTP 400 Bad Request
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(response.data['success'])

        # Assert user was NOT created in the database
        user_was_created = CustomUser.objects.filter(username='mismatchedstudent').exists()
        self.assertFalse(user_was_created)

    def test_successful_user_login(self):
        """
        Test that an existing user can log in with valid credentials.
        Expected: HTTP 200 OK and JWT access + refresh tokens.
        """
        login_payload = {
            'username': self.existing_username,
            'password': self.existing_password,
        }

        # Send POST request to login endpoint
        response = self.client.post(self.login_url, login_payload, format='json')

        # Assert HTTP 200 OK
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['success'])
        self.assertIn('tokens', response.data)
        self.assertEqual(response.data['user']['username'], self.existing_username)
        self.assertEqual(response.data['user']['role'], CustomUser.ROLE_TEACHER)

    def test_login_fails_with_incorrect_password(self):
        """
        Test that login is rejected when an incorrect password is provided.
        Expected: HTTP 401 Unauthorized.
        """
        invalid_login_payload = {
            'username': self.existing_username,
            'password': 'WrongPassword999!',
        }

        response = self.client.post(self.login_url, invalid_login_payload, format='json')

        # Assert HTTP 401 Unauthorized
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertFalse(response.data['success'])

    def test_unauthenticated_user_cannot_access_profile(self):
        """
        Test that /api/auth/me/ rejects requests without a JWT token.
        Expected: HTTP 401 Unauthorized.
        """
        # Send GET request without any Authorization header
        response = self.client.get(self.me_url)

        # Assert HTTP 401 Unauthorized
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_authenticated_user_can_access_profile(self):
        """
        Test that /api/auth/me/ returns user profile when a valid JWT token is provided.
        Expected: HTTP 200 OK with the authenticated user's details.
        """
        # Authenticate test client with the existing user
        self.client.force_authenticate(user=self.existing_user)

        response = self.client.get(self.me_url)

        # Assert HTTP 200 OK
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['success'])
        self.assertEqual(response.data['user']['username'], self.existing_username)
        self.assertEqual(response.data['user']['email'], self.existing_email)
