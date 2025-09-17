from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from .views import CollegeViewSet, DepartmentViewSet, FacultyViewSet, RoomViewSet, StudentViewSet, SubjectViewSet, SectionViewSet

router = DefaultRouter()
router.register(r"colleges", CollegeViewSet)
router.register(r"departments", DepartmentViewSet)
router.register(r"faculties", FacultyViewSet)
router.register(r"rooms", RoomViewSet)
router.register(r"students", StudentViewSet)
router.register(r"subjects", SubjectViewSet)
router.register(r"sections", SectionViewSet)

urlpatterns = [
    path("auth/token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("auth/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
]

urlpatterns += router.urls
