from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt


def health_check(request):
    """Simple health check endpoint for deployment verification."""
    return JsonResponse({
        "status": "healthy",
        "message": "Time-Table-Generator API is running!",
        "debug": settings.DEBUG,
        "api_prefix": settings.API_PREFIX
    })


urlpatterns = [
    path("", health_check, name="health_check"),
    path("health/", health_check, name="health_check_alt"),
    path("admin/", admin.site.urls),
    path(settings.API_PREFIX.strip("/") + "/", include("master_data.urls")),
]
