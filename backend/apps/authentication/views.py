# apps/authentication/views.py
# This file handles the logic for all authentication API endpoints.
# Each endpoint is implemented using standard DRF Class-Based APIViews.

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate

from .models import CustomUser
from .serializers import UserRegistrationSerializer, UserProfileSerializer


def generate_jwt_tokens_for_user(target_user):
    """
    Helper function to generate JWT access and refresh tokens for a given user.
    Breaking this out into a function keeps our views clean and reusable!
    """
    refresh_token = RefreshToken.for_user(target_user)
    access_token = refresh_token.access_token

    return {
        'access_token': str(access_token),
        'refresh_token': str(refresh_token),
    }


class RegisterView(APIView):
    """
    API endpoint: POST /api/auth/register/
    Permission: Public (anyone can register a new account)
    
    Receives registration details, validates them, saves the new user,
    and returns JWT tokens along with the user's profile details.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        # Step 1: Bind incoming request data to our serializer
        registration_serializer = UserRegistrationSerializer(data=request.data)

        # Step 2: Validate the input data
        if not registration_serializer.is_valid():
            # Return validation errors with HTTP 400 Bad Request
            return Response(
                {
                    'success': False,
                    'message': 'Registration validation failed. Please check your inputs.',
                    'errors': registration_serializer.errors,
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # Step 3: Save the validated user to the database
        created_user = registration_serializer.save()

        # Step 4: Generate JWT authentication tokens
        auth_tokens = generate_jwt_tokens_for_user(created_user)

        # Step 5: Serialize the user data to return in the response
        user_profile_data = UserProfileSerializer(created_user).data

        # Step 6: Return clean response with HTTP 201 Created
        return Response(
            {
                'success': True,
                'message': 'Account created successfully! Welcome to the School Management System.',
                'tokens': auth_tokens,
                'user': user_profile_data,
            },
            status=status.HTTP_201_CREATED
        )


class LoginView(APIView):
    """
    API endpoint: POST /api/auth/login/
    Permission: Public (anyone can submit login credentials)
    
    Accepts 'username' and 'password', verifies them, and returns JWT tokens.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        # Step 1: Extract username and password from the request body
        submitted_username = request.data.get('username', '').strip()
        submitted_password = request.data.get('password', '')

        # Step 2: Check that both fields were provided
        if not submitted_username or not submitted_password:
            return Response(
                {
                    'success': False,
                    'message': 'Both username and password are required to log in.',
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # Step 3: Authenticate credentials using Django's secure authenticate function
        authenticated_user = authenticate(
            username=submitted_username,
            password=submitted_password
        )

        # Step 4: Verify authentication result
        if authenticated_user is None:
            # We return a generic error message so attackers cannot guess valid usernames
            return Response(
                {
                    'success': False,
                    'message': 'Invalid username or password. Please verify your credentials.',
                },
                status=status.HTTP_401_UNAUTHORIZED
            )

        # Step 5: Check if the user's account is active
        if not authenticated_user.is_active:
            return Response(
                {
                    'success': False,
                    'message': 'Your account has been deactivated. Please contact the school administrator.',
                },
                status=status.HTTP_403_FORBIDDEN
            )

        # Step 6: Generate JWT access and refresh tokens
        auth_tokens = generate_jwt_tokens_for_user(authenticated_user)

        # Step 7: Serialize user profile information
        user_profile_data = UserProfileSerializer(authenticated_user).data

        # Step 8: Return successful response with tokens
        return Response(
            {
                'success': True,
                'message': 'Login successful!',
                'tokens': auth_tokens,
                'user': user_profile_data,
            },
            status=status.HTTP_200_OK
        )


class GetCurrentUserView(APIView):
    """
    API endpoint: 
      - GET /api/auth/me/  -> Retrieve current logged-in user profile
      - PATCH /api/auth/me/ -> Update current user's profile details
    
    Permission: Authenticated (User must provide a valid Bearer token in headers)
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # request.user is automatically populated by DRF JWT authentication
        logged_in_user = request.user

        # Serialize user instance to JSON-compatible data
        profile_serializer = UserProfileSerializer(logged_in_user)

        return Response(
            {
                'success': True,
                'user': profile_serializer.data,
            },
            status=status.HTTP_200_OK
        )

    def patch(self, request):
        # Allow logged-in users to update their own contact details
        logged_in_user = request.user

        # partial=True allows partial updates (e.g. only updating phone_number)
        profile_serializer = UserProfileSerializer(
            logged_in_user,
            data=request.data,
            partial=True
        )

        if not profile_serializer.is_valid():
            return Response(
                {
                    'success': False,
                    'message': 'Profile update validation failed.',
                    'errors': profile_serializer.errors,
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # Save updated user profile
        updated_user = profile_serializer.save()

        return Response(
            {
                'success': True,
                'message': 'Profile updated successfully.',
                'user': UserProfileSerializer(updated_user).data,
            },
            status=status.HTTP_200_OK
        )
