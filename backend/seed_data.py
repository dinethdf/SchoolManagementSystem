"""
Seed Initial Demo Data for School Management System

Creates initial test accounts for viva/presentation demonstration:
- Admin:   username: admin    / password: adminpassword123
- Teacher: username: teacher1 / password: teacherpassword123
- Student: username: student1 / password: studentpassword123
- Class:   Grade 10-A (Academic Year 2026-2027)
"""
import os
from datetime import date
import django

# Configure Django settings
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'schoolms.settings')
django.setup()

from apps.authentication.models import CustomUser
from apps.academics.models import SchoolClass, Subject
from apps.people.models import TeacherProfile, StudentProfile

def seed():
    print("🌱 Starting database seeding...")

    # 1. Create Admin User
    admin_user, created = CustomUser.objects.get_or_create(
        username='admin',
        defaults={
            'email': 'admin@schoolms.edu',
            'first_name': 'Super',
            'last_name': 'Admin',
            'role': CustomUser.ROLE_ADMIN,
            'is_staff': True,
            'is_superuser': True,
        }
    )
    if created:
        admin_user.set_password('adminpassword123')
        admin_user.save()
        print("✅ Admin user created: admin / adminpassword123")
    else:
        print("ℹ️ Admin user already exists.")

    # 2. Create Teacher User & Profile
    teacher_user, created = CustomUser.objects.get_or_create(
        username='teacher1',
        defaults={
            'email': 'teacher1@schoolms.edu',
            'first_name': 'Sarah',
            'last_name': 'Connor',
            'role': CustomUser.ROLE_TEACHER,
            'is_staff': True,
        }
    )
    if created:
        teacher_user.set_password('teacherpassword123')
        teacher_user.save()
        print("✅ Teacher user created: teacher1 / teacherpassword123")
    
    teacher_profile, created = TeacherProfile.objects.get_or_create(
        user=teacher_user,
        defaults={
            'employee_id': 'EMP-001',
            'qualification': 'M.Sc. Mathematics',
            'department': 'Mathematics',
            'specialization': 'Algebra & Geometry',
            'joining_date': date(2024, 1, 15),
        }
    )
    if created:
        print("✅ Teacher profile created: EMP-001")

    # 3. Create Class: Grade 10-A
    school_class, created = SchoolClass.objects.get_or_create(
        grade_level=10,
        section='A',
        academic_year='2026-2027',
        defaults={
            'name': 'Grade 10-A',
            'room_number': 'Room 101',
            'class_teacher': teacher_user,
        }
    )
    if created:
        print("✅ Class created: Grade 10-A")

    # 4. Create Subject: Mathematics
    subject, created = Subject.objects.get_or_create(
        code='MATH-10',
        school_class=school_class,
        defaults={
            'name': 'Mathematics',
            'description': 'Advanced High School Algebra and Geometry',
            'teacher': teacher_user,
            'periods_per_week': 5,
        }
    )
    if created:
        print("✅ Subject created: Mathematics (MATH-10)")

    # 5. Create Student User & Profile
    student_user, created = CustomUser.objects.get_or_create(
        username='student1',
        defaults={
            'email': 'student1@schoolms.edu',
            'first_name': 'John',
            'last_name': 'Doe',
            'role': CustomUser.ROLE_STUDENT,
        }
    )
    if created:
        student_user.set_password('studentpassword123')
        student_user.save()
        print("✅ Student user created: student1 / studentpassword123")

    student_profile, created = StudentProfile.objects.get_or_create(
        user=student_user,
        defaults={
            'admission_number': 'STU-2026-001',
            'roll_number': '101',
            'enrolled_class': school_class,
            'admission_date': date(2024, 9, 1),
            'blood_group': 'O+',
            'emergency_contact_name': 'Jane Doe',
            'emergency_contact_phone': '+1234567890',
        }
    )
    # 6. Create Parent User & Profile linked to student1
    from apps.people.models import ParentProfile

    parent_user, created = CustomUser.objects.get_or_create(
        username='parent1',
        defaults={
            'email': 'parent1@schoolms.edu',
            'first_name': 'Jane',
            'last_name': 'Doe',
            'role': CustomUser.ROLE_PARENT,
        }
    )
    if created:
        parent_user.set_password('parentpassword123')
        parent_user.save()
        print("✅ Parent user created: parent1 / parentpassword123")

    parent_profile, created = ParentProfile.objects.get_or_create(
        user=parent_user,
        defaults={
            'occupation': 'Architect',
            'relationship_to_child': 'Mother',
        }
    )
    if created:
        parent_profile.children.add(student_profile)
        print("✅ Parent profile created & linked to student1")

    # 7. Seed Initial Attendance Records for student1
    from apps.attendance.models import Attendance
    from datetime import timedelta

    today = date.today()
    sample_statuses = [
        ('present', 'Attended on time'),
        ('present', 'Attended on time'),
        ('late', 'Arrived 10 minutes late due to bus traffic'),
        ('present', 'Attended on time'),
        ('absent', 'Medical leave - submitted note'),
        ('present', 'Attended on time'),
        ('present', 'Attended on time'),
    ]

    for index, (attendance_status, remark_note) in enumerate(sample_statuses):
        attendance_day = today - timedelta(days=index)
        attendance_record, created = Attendance.objects.get_or_create(
            student=student_profile,
            school_class=school_class,
            date=attendance_day,
            defaults={
                'status': attendance_status,
                'subject': subject,
                'marked_by': teacher_user,
                'remarks': remark_note,
            }
        )
    print("✅ Seeded attendance records for student1")

    # 8. Seed Initial Assessment & Grade Records
    from apps.grades.models import Assessment, GradeRecord

    # Create Midterm Assessment
    midterm_assessment, created = Assessment.objects.get_or_create(
        name='Midterm Examination 2026',
        subject=subject,
        school_class=school_class,
        defaults={
            'assessment_type': 'midterm',
            'max_marks': 100,
            'assessment_date': today - timedelta(days=14),
            'academic_year': '2026-2027',
            'created_by': teacher_user,
        }
    )
    if created:
        print("✅ Assessment created: Midterm Examination 2026")

    # Create Quiz Assessment
    quiz_assessment, created = Assessment.objects.get_or_create(
        name='Quiz 1 - Linear Equations',
        subject=subject,
        school_class=school_class,
        defaults={
            'assessment_type': 'quiz',
            'max_marks': 25,
            'assessment_date': today - timedelta(days=7),
            'academic_year': '2026-2027',
            'created_by': teacher_user,
        }
    )
    if created:
        print("✅ Assessment created: Quiz 1 - Linear Equations")

    # Enter marks for student1
    midterm_grade, created = GradeRecord.objects.get_or_create(
        assessment=midterm_assessment,
        student=student_profile,
        defaults={
            'marks_obtained': 88.50,
            'remarks': 'Great analytical reasoning and neat presentation.',
            'marked_by': teacher_user,
        }
    )

    quiz_grade, created = GradeRecord.objects.get_or_create(
        assessment=quiz_assessment,
        student=student_profile,
        defaults={
            'marks_obtained': 23.00,
            'remarks': 'Excellent score on algebraic manipulation.',
            'marked_by': teacher_user,
        }
    )
    print("✅ Seeded grade records for student1")

    print("🎉 Database seeding completed successfully!")

if __name__ == '__main__':
    seed()

