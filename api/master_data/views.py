from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.db import transaction
import pandas as pd

from .models import Department, Faculty, Room, Student, Subject, Section, College, Timetable
from .serializers import (
    CollegeSerializer,
    DepartmentSerializer,
    FacultySerializer,
    RoomSerializer,
    StudentSerializer,
    SubjectSerializer,
    SectionSerializer,
    TimetableSerializer,
)


class CollegeViewSet(viewsets.ModelViewSet):
    queryset = College.objects.all()
    serializer_class = CollegeSerializer
    permission_classes = [AllowAny]
    filterset_fields = ["name", "code"]
    search_fields = ["name", "code"]
    ordering_fields = ["code", "name"]
    lookup_field = "code"

    @action(detail=True, methods=["get"], url_path="summary")
    def summary(self, request, pk=None):
        college = self.get_object()
        departments = Department.objects.filter(college=college)
        dept_ids = departments.values_list("id", flat=True)

        data = {
            "college": CollegeSerializer(college).data,
            "departments": DepartmentSerializer(departments, many=True).data,
            "faculties": FacultySerializer(Faculty.objects.filter(department_id__in=dept_ids), many=True).data,
            "students": StudentSerializer(Student.objects.filter(department_id__in=dept_ids), many=True).data,
            "rooms": RoomSerializer(Room.objects.filter(department_id__in=dept_ids), many=True).data,
            "subjects": SubjectSerializer(Subject.objects.filter(departments__in=departments).distinct(), many=True).data,
            "sections": SectionSerializer(Section.objects.filter(department_id__in=dept_ids), many=True).data,
        }
        return Response({"success": True, "data": data})

    @action(detail=True, methods=["get"], url_path="students")
    def students(self, request, pk=None):
        college = self.get_object()
        dept_ids = Department.objects.filter(college=college).values_list("id", flat=True)
        qs = Student.objects.filter(department_id__in=dept_ids)
        return Response({"results": StudentSerializer(qs, many=True).data})

    @action(detail=True, methods=["get"], url_path="faculties")
    def faculties(self, request, pk=None):
        college = self.get_object()
        dept_ids = Department.objects.filter(college=college).values_list("id", flat=True)
        qs = Faculty.objects.filter(department_id__in=dept_ids)
        return Response({"results": FacultySerializer(qs, many=True).data})

    @action(detail=True, methods=["get"], url_path="rooms")
    def rooms(self, request, pk=None):
        college = self.get_object()
        dept_ids = Department.objects.filter(college=college).values_list("id", flat=True)
        qs = Room.objects.filter(department_id__in=dept_ids)
        return Response({"results": RoomSerializer(qs, many=True).data})

    @action(detail=True, methods=["get"], url_path="subjects")
    def subjects(self, request, pk=None):
        college = self.get_object()
        depts = Department.objects.filter(college=college)
        qs = Subject.objects.filter(departments__in=depts).distinct()
        return Response({"results": SubjectSerializer(qs, many=True).data})

    @action(detail=True, methods=["get"], url_path="departments")
    def departments(self, request, pk=None):
        college = self.get_object()
        qs = Department.objects.filter(college=college)
        return Response({"results": DepartmentSerializer(qs, many=True).data})


class DepartmentViewSet(viewsets.ModelViewSet):
    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer
    permission_classes = [AllowAny]
    filterset_fields = ["name", "code", "college", "college__code"]
    search_fields = ["name", "code"]
    ordering_fields = ["name", "code"]


class RoomViewSet(viewsets.ModelViewSet):
    queryset = Room.objects.all()
    serializer_class = RoomSerializer
    permission_classes = [AllowAny]
    filterset_fields = ["room_type", "capacity", "department", "department__college", "department__college__code"]
    search_fields = ["number"]
    ordering_fields = ["capacity", "number"]

    @action(detail=False, methods=["post"], url_path="bulk-upload")
    def bulk_upload(self, request):
        college = None
        college_code = request.query_params.get("college_code") or request.data.get("college_code")
        if college_code:
            college = College.objects.filter(code=str(college_code).strip()).first()
        file = request.FILES.get("file")
        if not file:
            return Response({"detail": "No file provided"}, status=status.HTTP_400_BAD_REQUEST)
        try:
            df = pd.read_excel(file) if file.name.endswith(".xlsx") else pd.read_csv(file)
            required = {"number", "room_type", "capacity"}
            if not required.issubset(df.columns):
                return Response({"detail": f"Missing columns: {required - set(df.columns)}"}, status=400)
            created, updated = 0, 0
            with transaction.atomic():
                for _, row in df.iterrows():
                    dept = None
                    dept_code = row.get("department_code")
                    if dept_code:
                        defaults = {"name": str(dept_code)}
                        if college:
                            defaults["college"] = college
                        dept, created_d = Department.objects.get_or_create(code=str(dept_code), defaults=defaults)
                        if not created_d and college and dept.college_id is None:
                            dept.college = college
                            dept.save(update_fields=["college"])
                    obj, is_created = Room.objects.update_or_create(
                        number=str(row["number"]).strip(),
                        defaults={
                            "room_type": str(row.get("room_type", "lecture")),
                            "capacity": int(row.get("capacity", 0) or 0),
                            "department": dept,
                        },
                    )
                    created += 1 if is_created else 0
                    updated += 0 if is_created else 1
            return Response({"success": True, "data": {"created": created, "updated": updated}})
        except Exception as e:
            return Response({"detail": str(e)}, status=400)


class SubjectViewSet(viewsets.ModelViewSet):
    queryset = Subject.objects.all()
    serializer_class = SubjectSerializer
    permission_classes = [AllowAny]
    filterset_fields = ["category", "departments", "departments__college", "departments__college__code"]
    search_fields = ["name", "code"]
    ordering_fields = ["code", "name"]

    @action(detail=False, methods=["post"], url_path="bulk-upload")
    def bulk_upload(self, request):
        file = request.FILES.get("file")
        if not file:
            return Response({"detail": "No file provided"}, status=status.HTTP_400_BAD_REQUEST)
        try:
            df = pd.read_excel(file) if file.name.endswith(".xlsx") else pd.read_csv(file)
            required = {"code", "name", "category"}
            if not required.issubset(df.columns):
                return Response({"detail": f"Missing columns: {required - set(df.columns)}"}, status=400)
            created, updated, linked = 0, 0, 0
            with transaction.atomic():
                for _, row in df.iterrows():
                    obj, is_created = Subject.objects.update_or_create(
                        code=str(row["code"]).strip(),
                        defaults={
                            "name": str(row.get("name", "")),
                            "category": str(row.get("category", "core")),
                            "credits_theory": int(row.get("credits_theory", 0) or 0),
                            "credits_practical": int(row.get("credits_practical", 0) or 0),
                        },
                    )
                    created += 1 if is_created else 0
                    updated += 0 if is_created else 1
                    dept_codes = str(row.get("department_codes", "")).split(",") if row.get("department_codes") else []
                    if dept_codes:
                        depts = []
                        for code in dept_codes:
                            code = code.strip()
                            if not code:
                                continue
                            defaults = {"name": code}
                            if college:
                                defaults["college"] = college
                            dept, created_d = Department.objects.get_or_create(code=code, defaults=defaults)
                            if not created_d and college and dept.college_id is None:
                                dept.college = college
                                dept.save(update_fields=["college"])
                            depts.append(dept)
                        if depts:
                            obj.departments.set(depts)
                            linked += len(depts)
            return Response({"success": True, "data": {"created": created, "updated": updated, "dept_links": linked}})
        except Exception as e:
            return Response({"detail": str(e)}, status=400)


class FacultyViewSet(viewsets.ModelViewSet):
    queryset = Faculty.objects.select_related("department").all()
    serializer_class = FacultySerializer
    permission_classes = [AllowAny]
    filterset_fields = ["department", "experience_years", "department__college", "department__college__code"]
    search_fields = ["first_name", "last_name", "email"]
    ordering_fields = ["experience_years", "last_name"]

    @action(detail=False, methods=["post"], url_path="bulk-upload")
    def bulk_upload(self, request):
        file = request.FILES.get("file")
        if not file:
            return Response({"detail": "No file provided"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            df = pd.read_excel(file) if file.name.endswith(
                ".xlsx") else pd.read_csv(file)
            required_cols = {"first_name", "last_name",
                             "email", "department_code"}
            if not required_cols.issubset(df.columns):
                return Response({"detail": f"Missing columns: {required_cols - set(df.columns)}"}, status=400)

            with transaction.atomic():
                created = 0
                for _, row in df.iterrows():
                    defaults = {"name": row.get("department_name", row["department_code"]) }
                    if college:
                        defaults["college"] = college
                    dept, created_d = Department.objects.get_or_create(code=row["department_code"], defaults=defaults)
                    if not created_d and college and dept.college_id is None:
                        dept.college = college
                        dept.save(update_fields=["college"])
                    Faculty.objects.update_or_create(
                        email=row["email"],
                        defaults={
                            "first_name": row["first_name"],
                            "last_name": row["last_name"],
                            "department": dept,
                            "qualifications": row.get("qualifications", ""),
                            "experience_years": int(row.get("experience_years", 0) or 0),
                            "workload_capacity_hours": int(row.get("workload_capacity_hours", 16) or 16),
                        },
                    )
                    created += 1
            return Response({"success": True, "data": {"created": created}})
        except Exception as e:
            return Response({"detail": str(e)}, status=400)


class StudentViewSet(viewsets.ModelViewSet):
    queryset = Student.objects.select_related("department").all()
    serializer_class = StudentSerializer
    permission_classes = [AllowAny]
    filterset_fields = ["department", "current_semester", "department__college", "department__college__code"]
    search_fields = ["first_name", "last_name", "email", "enrollment_no"]
    ordering_fields = ["enrollment_no", "last_name"]

    @action(detail=False, methods=["post"], url_path="bulk-upload")
    def bulk_upload(self, request):
        file = request.FILES.get("file")
        if not file:
            return Response({"detail": "No file provided"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            df = pd.read_excel(file) if file.name.endswith(
                ".xlsx") else pd.read_csv(file)
            required_cols = {"first_name", "last_name", "email",
                             "enrollment_no", "department_code", "current_semester"}
            if not required_cols.issubset(df.columns):
                return Response({"detail": f"Missing columns: {required_cols - set(df.columns)}"}, status=400)

            with transaction.atomic():
                created = 0
                for _, row in df.iterrows():
                    defaults = {"name": row.get("department_name", row["department_code"]) }
                    if college:
                        defaults["college"] = college
                    dept, created_d = Department.objects.get_or_create(code=row["department_code"], defaults=defaults)
                    if not created_d and college and dept.college_id is None:
                        dept.college = college
                        dept.save(update_fields=["college"])
                    Student.objects.update_or_create(
                        enrollment_no=row["enrollment_no"],
                        defaults={
                            "first_name": row["first_name"],
                            "last_name": row["last_name"],
                            "email": row["email"],
                            "department": dept,
                            "current_semester": row["current_semester"],
                        },
                    )
                    created += 1
            return Response({"success": True, "data": {"created": created}})
        except Exception as e:
            return Response({"detail": str(e)}, status=400)


class SectionViewSet(viewsets.ModelViewSet):
    queryset = Section.objects.select_related("department").all()
    serializer_class = SectionSerializer
    permission_classes = [AllowAny]
    filterset_fields = ["department", "semester", "name", "department__college"]
    search_fields = ["name", "semester"]
    ordering_fields = ["name", "size"]


class TimetableViewSet(viewsets.ModelViewSet):
    queryset = Timetable.objects.select_related("department", "department__college").all()
    serializer_class = TimetableSerializer
    permission_classes = [AllowAny]
    filterset_fields = [
        "department",
        "department__college",
        "department__college__code",
        "section_letter",
        "year",
        "semester",
        "academic_year",
    ]
    search_fields = ["section_letter", "academic_year", "semester"]
    ordering_fields = ["created_at", "year", "semester"]
