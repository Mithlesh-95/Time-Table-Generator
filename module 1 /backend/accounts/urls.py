from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView

from .views import (
    UserRegistrationView, CustomTokenObtainPairView, UserLogoutView,
    UserProfileView, PasswordChangeView, UserListView, UserDetailView,
    UserActivityLogView, DepartmentListView, DepartmentDetailView,
    dashboard_data, health_check
)

# Create router for viewsets (if needed in future)
router = DefaultRouter()

urlpatterns = [
    # Authentication endpoints
    path('register/', UserRegistrationView.as_view(), name='user-register'),
    path('login/', CustomTokenObtainPairView.as_view(), name='user-login'),
    path('logout/', UserLogoutView.as_view(), name='user-logout'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token-refresh'),
    
    # User profile endpoints
    path('profile/', UserProfileView.as_view(), name='user-profile'),
    path('password/change/', PasswordChangeView.as_view(), name='password-change'),
    
    # User management endpoints (Admin only)
    path('users/', UserListView.as_view(), name='user-list'),
    path('users/<int:pk>/', UserDetailView.as_view(), name='user-detail'),
    
    # Activity logs (Super Admin only)
    path('activity-logs/', UserActivityLogView.as_view(), name='activity-logs'),
    
    # Department management (Super Admin only)
    path('departments/', DepartmentListView.as_view(), name='department-list'),
    path('departments/<int:pk>/', DepartmentDetailView.as_view(), name='department-detail'),
    
    # Dashboard and utility endpoints
    path('dashboard/', dashboard_data, name='dashboard-data'),
    path('health/', health_check, name='health-check'),
    
    # Include router URLs
    path('', include(router.urls)),
]