from django.urls import path
from .views import start_generation, get_status, cancel_generation

urlpatterns = [
    path("timetable/generate/start", start_generation, name="start_generation"),
    path("timetable/generate/status/<str:job_id>", get_status, name="get_generation_status"),
    path("timetable/generate/cancel/<str:job_id>", cancel_generation, name="cancel_generation"),
]
