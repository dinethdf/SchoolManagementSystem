"""
Seed initial sample assignments for Phase 7 demonstration.
Creates 2 active assignments for Grade 10-A with pending student submissions.
"""
import os
from datetime import date, timedelta
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'schoolms.settings')
django.setup()

from apps.authentication.models import CustomUser
from apps.academics.models import SchoolClass, Subject
from apps.people.models import StudentProfile
from apps.assignments.models import Assignment, Submission

def seed_assignments():
    print("🌱 Seeding Phase 7 Assignments & Homework...")

    try:
        teacher_user = CustomUser.objects.get(username='teacher1')
        school_class = SchoolClass.objects.get(name='Grade 10-A')
        subject = Subject.objects.filter(school_class=school_class).first()
    except Exception as exc:
        print(f"❌ Missing prerequisites: {exc}")
        return

    # Assignment 1: Homework
    assignment_1, created_1 = Assignment.objects.get_or_create(
        title="Chapter 5 Trigonometry Problem Set",
        school_class=school_class,
        subject=subject,
        defaults={
            'description': "Complete problems 1 through 15 on page 142. Show all step-by-step working for trigonometric identity proofs.",
            'assigned_by': teacher_user,
            'due_date': date.today() + timedelta(days=7),
            'max_marks': 20,
            'assignment_type': Assignment.TYPE_HOMEWORK,
            'is_active': True,
        }
    )
    if created_1:
        print(f"✅ Assignment created: '{assignment_1.title}' (Due in 7 days, 20 marks)")
    else:
        print(f"ℹ️ Assignment 1 already exists.")

    # Assignment 2: Project
    assignment_2, created_2 = Assignment.objects.get_or_create(
        title="Linear Algebra Real-World Application Project",
        school_class=school_class,
        subject=subject,
        defaults={
            'description': "Research and describe how matrices and linear systems are applied in computer graphics or GPS satellite triangulation.",
            'assigned_by': teacher_user,
            'due_date': date.today() + timedelta(days=14),
            'max_marks': 50,
            'assignment_type': Assignment.TYPE_PROJECT,
            'is_active': True,
        }
    )
    if created_2:
        print(f"✅ Assignment created: '{assignment_2.title}' (Due in 14 days, 50 marks)")
    else:
        print(f"ℹ️ Assignment 2 already exists.")

    # Initialize pending submissions for students in Grade 10-A
    enrolled_students = StudentProfile.objects.filter(enrolled_class=school_class)
    for assignment in [assignment_1, assignment_2]:
        for student in enrolled_students:
            submission, sub_created = Submission.objects.get_or_create(
                assignment=assignment,
                student=student,
                defaults={'status': Submission.STATUS_PENDING}
            )
            if sub_created:
                print(f"   -> Pending submission initialized for student: {student.admission_number}")

    print("🎉 Phase 7 assignments seed completed successfully!")

if __name__ == '__main__':
    seed_assignments()
