# apps/authentication/serializers.py
# Serializers convert complex Django model instances into Python native datatypes
# that can easily be rendered into JSON, and they validate incoming request data.

from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from .models import CustomUser


class UserRegistrationSerializer(serializers.ModelSerializer):
    """
    Serializer used for registering new users.
    Endpoint: POST /api/auth/register/
    
    Validations performed:
    - Username uniqueness
    - Email presence and formatting
    - Password and confirm_password match
    - Password complexity meets Django's security requirements
    """

    # We add confirm_password for double-checking user input
    # write_only=True ensures sensitive fields are never sent back in the response JSON
    password = serializers.CharField(
        write_only=True,
        required=True,
        validators=[validate_password],
        style={'input_type': 'password'},
        help_text="User's secret password."
    )
    confirm_password = serializers.CharField(
        write_only=True,
        required=True,
        style={'input_type': 'password'},
        help_text="Repeat password for confirmation."
    )

    class Meta:
        model = CustomUser
        fields = [
            'id',
            'username',
            'email',
            'first_name',
            'last_name',
            'password',
            'confirm_password',
            'role',
            'phone_number',
        ]
        extra_kwargs = {
            'email': {'required': True},
            'first_name': {'required': True},
            'last_name': {'required': True},
        }

    def validate(self, incoming_data):
        """
        Custom cross-field validation to ensure password and confirm_password are identical.
        """
        user_password = incoming_data.get('password')
        repeated_password = incoming_data.get('confirm_password')

        # Check if the two passwords match exactly
        if user_password != repeated_password:
            raise serializers.ValidationError({
                'confirm_password': 'Passwords do not match. Please ensure both fields are identical.'
            })

        return incoming_data

    def create(self, validated_data):
        """
        Creates and saves a new CustomUser in the database.
        Django's create_user automatically hashes the password before saving.
        """
        # Remove the temporary confirm_password field as it's not a database column
        validated_data.pop('confirm_password', None)

        # Extract individual fields
        user_username = validated_data.pop('username')
        user_email = validated_data.pop('email')
        user_password = validated_data.pop('password')

        # Create user using Django's secure helper which handles password hashing
        new_registered_user = CustomUser.objects.create_user(
            username=user_username,
            email=user_email,
            password=user_password,
            **validated_data
        )

        return new_registered_user


class UserProfileSerializer(serializers.ModelSerializer):
    """
    Serializer used to return user profile information to the frontend.
    Endpoint: GET /api/auth/me/
    
    Never includes password hashes or sensitive security attributes.
    """

    # Human-readable label for the role choice
    role_display = serializers.CharField(source='get_role_display', read_only=True)
    full_name = serializers.CharField(source='get_full_name', read_only=True)

    class Meta:
        model = CustomUser
        fields = [
            'id',
            'username',
            'email',
            'first_name',
            'last_name',
            'full_name',
            'role',
            'role_display',
            'phone_number',
            'address',
            'date_of_birth',
            'profile_picture',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'username', 'role', 'created_at', 'updated_at']
