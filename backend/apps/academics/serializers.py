# apps/academics/serializers.py
# Serializers convert complex Model instances into JSON data,
# and validate incoming data when creating or updating Classes and Subjects.

from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import SchoolClass, Subject

User = get_user_model()


class TeacherSummarySerializer(serializers.ModelSerializer):
    """
    Lightweight serializer to display teacher information inside Class and Subject responses.
    Does not expose sensitive user data.
    """
    full_name = serializers.CharField(source='get_full_name', read_only=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'full_name', 'email', 'phone_number']


class SubjectSerializer(serializers.ModelSerializer):
    """
    Serializer for the Subject model.
    Handles reading and writing subject records.
    """

    # Read-only nested representations for rich frontend displays
    teacher_details = TeacherSummarySerializer(source='teacher', read_only=True)
    class_name = serializers.CharField(source='school_class.name', read_only=True)

    # Primary key IDs for writing (creating or editing relations)
    school_class_id = serializers.PrimaryKeyRelatedField(
        queryset=SchoolClass.objects.all(),
        source='school_class',
        write_only=True,
        help_text="The ID of the SchoolClass this subject belongs to."
    )
    teacher_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.filter(role='teacher'),
        source='teacher',
        required=False,
        allow_null=True,
        write_only=True,
        help_text="The ID of the Teacher assigned to this subject (optional)."
    )

    class Meta:
        model = Subject
        fields = [
            'id',
            'name',
            'code',
            'description',
            'periods_per_week',
            'school_class',
            'class_name',
            'school_class_id',
            'teacher',
            'teacher_details',
            'teacher_id',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'school_class', 'teacher', 'created_at', 'updated_at']

    def validate_code(self, code_value):
        """Standardize subject code to uppercase (e.g. math-10 -> MATH-10)."""
        return code_value.strip().upper()


class SchoolClassSerializer(serializers.ModelSerializer):
    """
    Serializer for the SchoolClass model.
    Handles reading and writing school classes.
    """

    # Read-only nested teacher object for easy UI rendering
    class_teacher_details = TeacherSummarySerializer(source='class_teacher', read_only=True)

    # Read-only count of subjects currently attached to this class
    total_subjects = serializers.IntegerField(source='get_subject_count', read_only=True)

    # Nested list of subjects taught in this class
    subjects = SubjectSerializer(many=True, read_only=True)

    # Writable teacher ID field
    class_teacher_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.filter(role='teacher'),
        source='class_teacher',
        required=False,
        allow_null=True,
        write_only=True,
        help_text="The ID of the assigned class teacher (must have role='teacher')."
    )

    class Meta:
        model = SchoolClass
        fields = [
            'id',
            'name',
            'grade_level',
            'section',
            'academic_year',
            'room_number',
            'class_teacher',
            'class_teacher_details',
            'class_teacher_id',
            'total_subjects',
            'subjects',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'class_teacher', 'created_at', 'updated_at']

    def validate(self, input_data):
        """
        Validate class fields before saving.
        Ensures section is uppercase and grade_level is a valid school grade.
        """
        grade_level = input_data.get('grade_level')
        section = input_data.get('section')

        # Check grade level range (e.g. Grades 1 to 13)
        if grade_level is not None and (grade_level < 1 or grade_level > 13):
            raise serializers.ValidationError({
                'grade_level': 'Grade level must be between 1 and 13.'
            })

        # Ensure section is stored as uppercase (e.g. 'a' -> 'A')
        if section is not None:
            input_data['section'] = section.strip().upper()

        return input_data
