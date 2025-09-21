from django.core.management.base import BaseCommand
from master_data.models import College, Department, Room, Subject, Student, Faculty

class Command(BaseCommand):
    help = "Link existing departments and related data to a specific college by code/name."

    def add_arguments(self, parser):
        parser.add_argument("--college_code", type=str, default="CMRN", help="College code to use/create")
        parser.add_argument("--college_name", type=str, default="CMR Engineering College", help="College name")
        parser.add_argument("--force", action="store_true", help="Relink all departments to this college (even if already linked)")
        parser.add_argument("--default_dept_code", type=str, default="CSM", help="Default department code for linking rooms/subjects")

    def handle(self, *args, **options):
        code = options["college_code"].strip()
        name = options["college_name"].strip()
        college, created = College.objects.get_or_create(code=code, defaults={"name": name})
        if not created and college.name != name:
            # Keep existing name; only log
            pass

        force = options["--force"] if "--force" in options else options.get("force", False)

        if force:
            qs = Department.objects.all()
        else:
            qs = Department.objects.filter(college__isnull=True)

        updated = 0
        preview = []
        for dept in qs.iterator():
            prev = dept.college.code if dept.college else None
            dept.college = college
            dept.save(update_fields=["college"])
            updated += 1
            if len(preview) < 5:
                preview.append(f"{dept.code} ({prev} -> {college.code})")

        note = "(force) " if force else ""
        self.stdout.write(self.style.SUCCESS(f"{note}Linked {updated} departments to college {college.code} - {college.name}"))
        if preview:
            self.stdout.write("e.g.: " + ", ".join(preview))

        # Ensure default CSM department exists under this college
        default_dept_code = options.get("default_dept_code", "CSM").strip() or "CSM"
        default_dept, _ = Department.objects.get_or_create(code=default_dept_code, defaults={"name": default_dept_code, "college": college})
        if default_dept.college_id != college.id:
            default_dept.college = college
            default_dept.save(update_fields=["college"])

        # Attach any rooms without department to CSM
        rooms_linked = Room.objects.filter(department__isnull=True).update(department=default_dept)
        if rooms_linked:
            self.stdout.write(self.style.SUCCESS(f"Linked {rooms_linked} rooms to {default_dept_code}"))

        # Attach any subjects without departments to include CSM
        subjects_linked = 0
        for subj in Subject.objects.filter(departments__isnull=True).iterator():
            subj.departments.add(default_dept)
            subjects_linked += 1
        if subjects_linked:
            self.stdout.write(self.style.SUCCESS(f"Linked {subjects_linked} subjects to {default_dept_code}"))

        # Attach any students/faculty without department to CSM
        students_linked = Student.objects.filter(department__isnull=True).update(department=default_dept)
        faculties_linked = Faculty.objects.filter(department__isnull=True).update(department=default_dept)
        if students_linked:
            self.stdout.write(self.style.SUCCESS(f"Linked {students_linked} students to {default_dept_code}"))
        if faculties_linked:
            self.stdout.write(self.style.SUCCESS(f"Linked {faculties_linked} faculties to {default_dept_code}"))

        # Try linking timetables if a model exists
        try:
            from timetable.models import Timetable  # type: ignore
            # If Timetable has a department or college field, set it.
            if hasattr(Timetable, 'department'):
                tl = Timetable.objects.filter(department__isnull=True).update(department=default_dept)
                if tl:
                    self.stdout.write(self.style.SUCCESS(f"Linked {tl} timetables to department {default_dept_code}"))
            elif hasattr(Timetable, 'college'):
                tl = Timetable.objects.update(college=college)
                if tl:
                    self.stdout.write(self.style.SUCCESS(f"Linked {tl} timetables to college {code}"))
        except Exception:
            # Timetable app or model not present; skip silently
            pass
