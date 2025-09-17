from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.db import transaction
import pandas as pd

from .models import Department, Faculty, Room, Student, Subject, Section, College
from .serializers import (
    CollegeSerializer,
    DepartmentSerializer,
    FacultySerializer,
    RoomSerializer,
    StudentSerializer,
    SubjectSerializer,
    SectionSerializer,
)


class CollegeViewSet(viewsets.ModelViewSet):
    queryset = College.objects.all()
    serializer_class = CollegeSerializer
    permission_classes = [AllowAny]
    filterset_fields = ["name", "code"]
    search_fields = ["name", "code"]
    ordering_fields = ["code", "name"]

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


class DepartmentViewSet(viewsets.ModelViewSet):
    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer
    permission_classes = [AllowAny]
    filterset_fields = ["name", "code", "college"]
    search_fields = ["name", "code"]
    ordering_fields = ["name", "code"]


class RoomViewSet(viewsets.ModelViewSet):
    queryset = Room.objects.all()
    serializer_class = RoomSerializer
    permission_classes = [AllowAny]
    filterset_fields = ["room_type", "capacity", "department", "department__college"]
    search_fields = ["number"]
    ordering_fields = ["capacity", "number"]


class SubjectViewSet(viewsets.ModelViewSet):
    queryset = Subject.objects.all()
    serializer_class = SubjectSerializer
    permission_classes = [AllowAny]
    filterset_fields = ["category", "departments"]
    search_fields = ["name", "code"]
    ordering_fields = ["code", "name"]


class FacultyViewSet(viewsets.ModelViewSet):
    queryset = Faculty.objects.select_related("department").all()
    serializer_class = FacultySerializer
    permission_classes = [AllowAny]
    filterset_fields = ["department", "experience_years", "department__college"]
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
                    dept, _ = Department.objects.get_or_create(code=row["department_code"], defaults={
                                                               "name": row.get("department_name", row["department_code"])})
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
    filterset_fields = ["department", "current_semester", "department__college"]
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
                    dept, _ = Department.objects.get_or_create(code=row["department_code"], defaults={
                                                               "name": row.get("department_name", row["department_code"])})
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
