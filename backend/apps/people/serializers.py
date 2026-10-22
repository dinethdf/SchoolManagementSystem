# apps/people/serializers.py
# Serializers for StudentProfile, TeacherProfile, and ParentProfile models.
# Handles data conversion between JSON and Python objects with full validation.

from rest_framework import serializers
from django.contrib.auth import get_user_model
from apps.academics.models import SchoolClass
from .models import StudentProfile, TeacherProfile, ParentProfile

User = get_user_model()


class UserSummarySerializer(serializers.ModelSerializer):
    """
    Compact user summary to embed inside profile JSON responses.
    """
    full_name = serializers.CharField(source='get_full_name', read_only=True)

    class Meta:
        model = User
        fields = [
            'id',
            'username',
            'first_name',
            'last_name',
            'full_name',
            'email',
            'role',
            'phone_number',
            'address',
            'date_of_birth',
            'profile_picture',
        ]


class ClassSummarySerializer(serializers.ModelSerializer):
    """
    Compact class summary to embed inside Student responses.
    """
    class Meta:
        model = SchoolClass
        fields = ['id', 'name', 'grade_level', 'section', 'academic_year', 'room_number']


# ==============================================================================
# STUDENT SERIALIZER
# ==============================================================================

class StudentProfileSerializer(serializers.ModelSerializer):
    """
    Serializer for StudentProfile model.
    Supports reading full student details and writing new student records.
    """

    # Read-only nested details
    user = UserSummarySerializer(read_only=True)
    enrolled_class = ClassSummarySerializer(read_only=True)

    # Writable ID fields for linking relations
    user_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.filter(role='student'),
        source='user',
        write_only=True,
        help_text="ID of the student user account (must have role='student')."
    )
    enrolled_class_id = serializers.PrimaryKeyRelatedField(
        queryset=SchoolClass.objects.all(),
        source='enrolled_class',
        required=False,
        allow_null=True,
        write_only=True,
        help_text="ID of the SchoolClass to enroll this student in."
    )

    class Meta:
        model = StudentProfile
        fields = [
            'id',
            'user',
            'user_id',
            'admission_number',
            'enrolled_class',
            'enrolled_class_id',
            'roll_number',
            'admission_date',
            'blood_group',
            'emergency_contact_name',
            'emergency_contact_phone',
            'emergency_contact_relationship',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def validate_admission_number(self, value):
        """Standardize admission number format to uppercase."""
        return value.strip().upper()


# ==============================================================================
# TEACHER SERIALIZER
# ==============================================================================

class TeacherProfileSerializer(serializers.ModelSerializer):
    """
    Serializer for TeacherProfile model.
    """

    user = UserSummarySerializer(read_only=True)
    user_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.filter(role='teacher'),
        source='user',
        write_only=True,
        help_text="ID of the teacher user account (must have role='teacher')."
    )

    class Meta:
        model = TeacherProfile
        fields = [
            'id',
            'user',
            'user_id',
            'employee_id',
            'qualification',
            'joining_date',
            'department',
            'specialization',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def validate_employee_id(self, value):
        """Standardize employee ID to uppercase."""
        return value.strip().upper()


# ==============================================================================
# PARENT SERIALIZER
# ==============================================================================

class ParentProfileSerializer(serializers.ModelSerializer):
    """
    Serializer for ParentProfile model.
    Includes linked student children records.
    """

    user = UserSummarySerializer(read_only=True)
    user_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.filter(role='parent'),
        source='user',
        write_only=True,
        help_text="ID of the parent user account (must have role='parent')."
    )

    # Read-only nested children profiles
    children = StudentProfileSerializer(many=True, read_only=True)

    # Writable list of StudentProfile IDs
    children_ids = serializers.PrimaryKeyRelatedField(
        queryset=StudentProfile.objects.all(),
        source='children',
        many=True,
        required=False,
        write_only=True,
        help_text="List of StudentProfile IDs that belong to this parent."
    )

    class Meta:
        model = ParentProfile
        fields = [
            'id',
            'user',
            'user_id',
            'children',
            'children_ids',
            'occupation',
            'relationship_to_child',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
