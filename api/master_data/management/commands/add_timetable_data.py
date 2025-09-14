from django.core.management.base import BaseCommand
from master_data.models import Department, Faculty, Room, Student, Subject, Section
from django.db import transaction


class Command(BaseCommand):
    help = 'Add sample timetable data from B.Tech CSE (AI&ML) III Sem'

    def handle(self, *args, **options):
        with transaction.atomic():
            # Create Department
            dept, created = Department.objects.get_or_create(
                code="CSE-AIML",
                defaults={'name': "Computer Science Engineering (AI & ML)"}
            )
            if created:
                self.stdout.write(f"Created department: {dept}")

            # Create Room
            room, created = Room.objects.get_or_create(
                number="F-209",
                defaults={
                    'room_type': 'lecture',
                    'capacity': 60
                }
            )
            if created:
                self.stdout.write(f"Created room: {room}")

            # Create Subjects with shortcuts
            subjects_data = [
                # Theory Subjects
                ('PP', 'Python Programming', 'A1501PC', 'Major', 3, 0),
                ('ATCD', 'Automata Theory and Compiler Design',
                 'CS502PC', 'Major', 4, 0),
                ('SEFA', 'Statistics, Economics and Financial Analysis',
                 'SM502PC', 'Major', 3, 0),
                ('DAR', 'Data Analytics using R', 'A1504PC', 'Major', 3, 0),
                ('WP', 'Web Programming', 'A1513PE', 'PE', 3, 0),
                ('IPR', 'Intellectual Property Rights', 'MC510', 'Minor', 2, 0),

                # Lab Subjects
                ('PPLab', 'Python Programming Lab', 'A1505PC', 'Major', 0, 2),
                ('ACSLab', 'Advanced Communication Skills Lab', 'EX506HS', 'AEC', 0, 2),
                ('DARLab', 'Data Analytics Lab (R Programming)',
                 'A1507PC', 'Major', 0, 2),
                ('UIDesign', 'Skill Development Course - V (UI design-Flutter)',
                 'SD512PC', 'SEC', 0, 2),

                # Other Activities
                ('Club', 'Club Activity', 'CLUB001', 'VAC', 0, 1),
                ('TP', 'Training & Placement', 'TP001', 'VAC', 0, 1),
            ]

            for short_name, full_name, code, category, theory_credits, practical_credits in subjects_data:
                subject, created = Subject.objects.get_or_create(
                    code=code,
                    defaults={
                        'name': f"{full_name} ({short_name})",
                        'category': category,
                        'credits_theory': theory_credits,
                        'credits_practical': practical_credits
                    }
                )
                if created:
                    self.stdout.write(f"Created subject: {subject}")

                # Associate with department
                subject.departments.add(dept)

            # Create Faculty
            faculty_data = [
                ('Mrs.', 'M.', 'Pooja', 'pooja.m@college.edu'),
                ('Mr.', 'Lal Bahadur', 'Pandey', 'lbpandey@college.edu'),
                ('Mrs.', '', 'Kalpana', 'kalpana@college.edu'),
                ('Mr.', 'N.', 'Venkatesh', 'n.venkatesh@college.edu'),
                ('Mr.', 'B. Sai', 'Kumar', 'bsaikumar@college.edu'),
                ('Mr.', 'R.', 'Chakravarthy', 'r.chakravarthy@college.edu'),
                ('Mrs.', 'Shaik', 'Saheer', 'shaik.saheer@college.edu'),
                ('Dr.', 'R.', 'Venkataramana', 'r.venkataramana@college.edu'),
                ('Mr.', 'Shyam', 'Babu', 'shyam.babu@college.edu'),
                ('Mrs.', '', 'Sumangala', 'sumangala@college.edu'),
                ('Mrs.', 'Siva', 'Jyothi', 'siva.jyothi@college.edu'),
                ('Mrs.', '', 'Swaroopa', 'swaroopa@college.edu'),
                ('Mr.', 'Himanshu', 'Nayak', 'himanshu.nayak@college.edu'),
            ]

            for title, first_name, last_name, email in faculty_data:
                display_first = f"{title} {first_name}".strip()
                faculty, created = Faculty.objects.get_or_create(
                    email=email,
                    defaults={
                        'first_name': display_first,
                        'last_name': last_name,
                        'department': dept,
                        'qualifications': 'M.Tech',
                        'experience_years': 5,
                        'workload_capacity_hours': 16
                    }
                )
                if created:
                    self.stdout.write(f"Created faculty: {faculty}")

            # Create Section
            section, created = Section.objects.get_or_create(
                department=dept,
                semester="III B.Tech I SEM",
                name="A",
                defaults={'size': 60}
            )
            if created:
                self.stdout.write(f"Created section: {section}")

            # Create some sample students
            student_data = [
                ('21051A66', 'Rajesh', 'Kumar'),
                ('21051A67', 'Priya', 'Sharma'),
                ('21051A68', 'Amit', 'Singh'),
                ('21051A69', 'Sneha', 'Patel'),
                ('21051A70', 'Rohit', 'Verma'),
            ]

            for enrollment, first_name, last_name in student_data:
                student, created = Student.objects.get_or_create(
                    enrollment_no=enrollment,
                    defaults={
                        'first_name': first_name,
                        'last_name': last_name,
                        'email': f"{enrollment.lower()}@student.college.edu",
                        'department': dept,
                        'current_semester': "III B.Tech I SEM"
                    }
                )
                if created:
                    self.stdout.write(f"Created student: {student}")

            self.stdout.write(
                self.style.SUCCESS(
                    'Successfully added B.Tech CSE (AI&ML) III Sem timetable data!\n'
                    'Subject shortcuts added:\n'
                    '- PP (Python Programming)\n'
                    '- ATCD (Automata Theory and Compiler Design)\n'
                    '- SEFA (Statistics, Economics and Financial Analysis)\n'
                    '- DAR (Data Analytics using R)\n'
                    '- WP (Web Programming)\n'
                    '- PPLab (Python Programming Lab)\n'
                    '- ACSLab (Advanced Communication Skills Lab)\n'
                    '- DARLab (Data Analytics Lab)\n'
                    '- UIDesign (UI Design Flutter)\n'
                    '- IPR (Intellectual Property Rights)\n'
                    '- Club (Club Activity)\n'
                    '- TP (Training & Placement)'
                )
            )
