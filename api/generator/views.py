import threading
import time
import uuid
from typing import Dict, Any

from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from master_data.models import Department, Timetable

# Very simple in-memory job store for development
JOBS: Dict[str, Dict[str, Any]] = {}

STEPS = [
    ("input_validation", 30),
    ("generation", 60),
    ("conflict_check", 85),
    ("success", 100),
]


def _advance_job(job_id: str):
    job = JOBS.get(job_id)
    if not job or job.get("canceled"):
        return

    current_index = job.get("step_index", 0)
    if current_index >= len(STEPS):
        return

    step_name, target_progress = STEPS[current_index]
    job["step"] = step_name

    # Increase progress gradually towards target
    if job["progress"] < target_progress:
        job["progress"] = min(target_progress, job["progress"] + 5)
        # schedule next tick
        threading.Timer(0.8, _advance_job, args=(job_id,)).start()
    else:
        # move to next step
        job["step_index"] = current_index + 1
        if job["step_index"] < len(STEPS):
            threading.Timer(0.8, _advance_job, args=(job_id,)).start()
        else:
            job["step"] = "success"
            job["progress"] = 100
            # Provide an inline result that matches TimetableData shape expected by the frontend
            # In a real system, replace this with the actual generated timetable for this job_id
            job["result"] = {
                "metadata": {
                    "semester": str(job.get("params", {}).get("semester", "")),
                    "branch": str(job.get("params", {}).get("branch", "")),
                    "section": f"Section {job.get('params', {}).get('section_letter', '')}".strip(),
                    "academicYear": str(job.get("params", {}).get("academic_year", "")),
                },
                "schedule": {
                    "Monday": {
                        "09:00 - 09:50": {"subject": "DBMS", "teacher": "Dr. Rao", "room": "B201", "type": "lecture", "subjectCode": "CS302"},
                        "10:00 - 10:50": {"subject": "OS", "teacher": "Prof. Kumar", "room": "B202", "type": "lecture", "subjectCode": "CS305"},
                        "11:00 - 11:50": {"subject": "CN", "teacher": "Ms. Iyer", "room": "B210", "type": "lecture", "subjectCode": "CS307"},
                        "12:00 - 12:50": {"subject": "AI", "teacher": "Dr. Mehta", "room": "B211", "type": "lecture", "subjectCode": "CS401"},
                        "13:30 - 14:20": {"subject": "DBMS Lab", "teacher": "Dr. Rao", "room": "Lab L1", "type": "lab", "subjectCode": "CS302"},
                        "14:30 - 15:20": {"subject": "DBMS Lab", "teacher": "Dr. Rao", "room": "Lab L1", "type": "lab", "subjectCode": "CS302"},
                    },
                    "Tuesday": {
                        "09:00 - 09:50": {"subject": "Maths", "teacher": "Dr. Singh", "room": "B105", "type": "lecture", "subjectCode": "MA201"},
                        "10:00 - 10:50": {"subject": "Maths", "teacher": "Dr. Singh", "room": "B105", "type": "lecture", "subjectCode": "MA201"},
                        "11:00 - 11:50": {"subject": "OS", "teacher": "Prof. Kumar", "room": "B202", "type": "lecture", "subjectCode": "CS305"},
                        "12:00 - 12:50": {"subject": "CN", "teacher": "Ms. Iyer", "room": "B210", "type": "lecture", "subjectCode": "CS307"},
                        "13:30 - 14:20": {"subject": "Tutorial", "teacher": "Staff", "room": "T-1", "type": "tutorial"},
                        "14:30 - 15:20": {"subject": "Free", "teacher": "", "room": "", "type": "free"},
                    },
                    "Wednesday": {
                        "09:00 - 09:50": {"subject": "AI", "teacher": "Dr. Mehta", "room": "B211", "type": "lecture", "subjectCode": "CS401"},
                        "10:00 - 10:50": {"subject": "AI", "teacher": "Dr. Mehta", "room": "B211", "type": "lecture", "subjectCode": "CS401"},
                        "11:00 - 11:50": {"subject": "DBMS", "teacher": "Dr. Rao", "room": "B201", "type": "lecture", "subjectCode": "CS302"},
                        "12:00 - 12:50": {"subject": "OS", "teacher": "Prof. Kumar", "room": "B202", "type": "lecture", "subjectCode": "CS305"},
                        "13:30 - 14:20": {"subject": "CN", "teacher": "Ms. Iyer", "room": "B210", "type": "lecture", "subjectCode": "CS307"},
                        "14:30 - 15:20": {"subject": "Seminar", "teacher": "Staff", "room": "Sem-1", "type": "lecture"},
                    },
                    "Thursday": {
                        "09:00 - 09:50": {"subject": "DBMS", "teacher": "Dr. Rao", "room": "B201", "type": "lecture", "subjectCode": "CS302"},
                        "10:00 - 10:50": {"subject": "CN", "teacher": "Ms. Iyer", "room": "B210", "type": "lecture", "subjectCode": "CS307"},
                        "11:00 - 11:50": {"subject": "OS Lab", "teacher": "Prof. Kumar", "room": "Lab L2", "type": "lab", "subjectCode": "CS305"},
                        "12:00 - 12:50": {"subject": "OS Lab", "teacher": "Prof. Kumar", "room": "Lab L2", "type": "lab", "subjectCode": "CS305"},
                        "13:30 - 14:20": {"subject": "Maths", "teacher": "Dr. Singh", "room": "B105", "type": "lecture", "subjectCode": "MA201"},
                        "14:30 - 15:20": {"subject": "Free", "teacher": "", "room": "", "type": "free"},
                    },
                    "Friday": {
                        "09:00 - 09:50": {"subject": "CN", "teacher": "Ms. Iyer", "room": "B210", "type": "lecture", "subjectCode": "CS307"},
                        "10:00 - 10:50": {"subject": "AI", "teacher": "Dr. Mehta", "room": "B211", "type": "lecture", "subjectCode": "CS401"},
                        "11:00 - 11:50": {"subject": "DBMS", "teacher": "Dr. Rao", "room": "B201", "type": "lecture", "subjectCode": "CS302"},
                        "12:00 - 12:50": {"subject": "OS", "teacher": "Prof. Kumar", "room": "B202", "type": "lecture", "subjectCode": "CS305"},
                        "13:30 - 14:20": {"subject": "Tutorial", "teacher": "Staff", "room": "T-1", "type": "tutorial"},
                        "14:30 - 15:20": {"subject": "Free", "teacher": "", "room": "", "type": "free"},
                    },
                    "Saturday": {
                        "09:00 - 09:50": {"subject": "Elective", "teacher": "Staff", "room": "B120", "type": "lecture"},
                        "10:00 - 10:50": {"subject": "Elective", "teacher": "Staff", "room": "B120", "type": "lecture"},
                        "11:00 - 11:50": {"subject": "Sports", "teacher": "Coach", "room": "Ground", "type": "free"},
                        "12:00 - 12:50": {"subject": "Club", "teacher": "Staff", "room": "Auditorium", "type": "free"},
                        "13:30 - 14:20": {"subject": "Free", "teacher": "", "room": "", "type": "free"},
                        "14:30 - 15:20": {"subject": "Free", "teacher": "", "room": "", "type": "free"},
                    },
                },
            }
            # Auto-save the timetable so the frontend dropdown updates immediately
            try:
                params = job.get("params", {})
                dept_id = params.get("department_id")
                if dept_id and Department.objects.filter(id=dept_id).exists():
                    base_letter = (str(params.get("section_letter", "A")).upper() or "A")
                    year = int(params.get("year") or 1)
                    sem = str(params.get("semester") or "")
                    ay = str(params.get("academic_year") or "")
                    # Create main section
                    Timetable.objects.create(
                        department_id=dept_id,
                        section_letter=base_letter,
                        year=year,
                        semester=sem,
                        academic_year=ay,
                        data=job["result"],
                    )
                    # Also ensure B and C exist for demo variety
                    for extra in ["B", "C"]:
                        if extra == base_letter:
                            continue
                        exists = Timetable.objects.filter(
                            department_id=dept_id,
                            year=year,
                            semester=sem,
                            academic_year=ay,
                            section_letter=extra,
                        ).exists()
                        if not exists:
                            alt = dict(job["result"])  # shallow copy
                            # tweak metadata.section to reflect letter
                            alt_meta = dict(alt.get("metadata", {}))
                            alt_meta["section"] = f"Section {extra}"
                            alt["metadata"] = alt_meta
                            Timetable.objects.create(
                                department_id=dept_id,
                                section_letter=extra,
                                year=year,
                                semester=sem,
                                academic_year=ay,
                                data=alt,
                            )
            except Exception:
                # Ignore autosave errors; UI can still render from inline result
                pass


@api_view(["POST"])
def start_generation(request):
    payload = request.data or {}
    job_id = str(uuid.uuid4())
    JOBS[job_id] = {
        "jobId": job_id,
        "step": "input_validation",
        "step_index": 0,
        "progress": 5,
        "params": payload,
        "canceled": False,
    }
    # Kick off background progression
    threading.Timer(0.5, _advance_job, args=(job_id,)).start()
    return Response({
        "success": True,
        "data": {"jobId": job_id}
    }, status=status.HTTP_202_ACCEPTED)


@api_view(["GET"])
def get_status(request, job_id: str):
    job = JOBS.get(job_id)
    if not job:
        return Response({"success": False, "message": "Job not found"}, status=status.HTTP_404_NOT_FOUND)
    # Map to frontend contract
    data = {
        "jobId": job["jobId"],
        "step": job["step"],
        "progress": job["progress"],
    }
    if job.get("result"):
        data["result"] = job["result"]
    return Response({"success": True, "data": data})


@api_view(["POST"])
def cancel_generation(request, job_id: str):
    job = JOBS.get(job_id)
    if not job:
        return Response({"success": False, "message": "Job not found"}, status=status.HTTP_404_NOT_FOUND)
    job["canceled"] = True
    job["step"] = "failed"
    job["error"] = "Canceled by user"
    return Response({"success": True, "data": {"canceled": True}})
