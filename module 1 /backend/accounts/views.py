from rest_framework import status, generics, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth import login, logout
from django.utils import timezone
from django.db.models import Q

from .models import User, UserActivityLog, Department
from .serializers import (
    UserRegistrationSerializer, UserLoginSerializer, UserProfileSerializer,
    UserListSerializer, PasswordChangeSerializer, UserActivityLogSerializer,
    DepartmentSerializer
)
from .permissions import IsSuperAdmin, IsDeptAdminOrSuperAdmin
from .utils import get_client_ip, log_user_activity


class UserRegistrationView(generics.CreateAPIView):
    """User registration endpoint"""
    
    queryset = User.objects.all()
    serializer_class = UserRegistrationSerializer
    permission_classes = [permissions.AllowAny]  # Allow public registration
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        # Log account creation
        log_user_activity(
            user=user,
            action='account_created',
            request=request,
            details={'registered_by': 'self'}
        )
        
        # Generate tokens
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'message': 'User registered successfully',
            'user': UserProfileSerializer(user).data,
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }
        }, status=status.HTTP_201_CREATED)


class CustomTokenObtainPairView(TokenObtainPairView):
    """Custom login view with activity logging"""
    
    def post(self, request, *args, **kwargs):
        serializer = UserLoginSerializer(
            data=request.data,
            context={'request': request}
        )
        
        try:
            serializer.is_valid(raise_exception=True)
            user = serializer.validated_data['user']
            
            # Generate tokens
            refresh = RefreshToken.for_user(user)
            
            # Update last login
            user.last_login = timezone.now()
            user.save(update_fields=['last_login'])
            
            # Log successful login
            log_user_activity(
                user=user,
                action='login',
                request=request,
                success=True
            )
            
            return Response({
                'message': 'Login successful',
                'user': UserProfileSerializer(user).data,
                'tokens': {
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                }
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            # Log failed login attempt
            username = request.data.get('username', 'unknown')
            try:
                user = User.objects.get(username=username)
            except User.DoesNotExist:
                user = None
            
            log_user_activity(
                user=user,
                action='failed_login',
                request=request,
                success=False,
                details={'username': username, 'error': str(e)}
            )
            
            return Response({
                'error': 'Invalid credentials'
            }, status=status.HTTP_401_UNAUTHORIZED)


class UserLogoutView(APIView):
    """User logout endpoint"""
    
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        try:
            refresh_token = request.data.get("refresh_token")
            if refresh_token:
                token = RefreshToken(refresh_token)
                token.blacklist()
            
            # Log logout
            log_user_activity(
                user=request.user,
                action='logout',
                request=request,
                success=True
            )
            
            return Response({
                'message': 'Successfully logged out'
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                'error': 'Error logging out'
            }, status=status.HTTP_400_BAD_REQUEST)


class UserProfileView(generics.RetrieveUpdateAPIView):
    """User profile view and update"""
    
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        return self.request.user
    
    def update(self, request, *args, **kwargs):
        response = super().update(request, *args, **kwargs)
        
        # Log profile update
        log_user_activity(
            user=request.user,
            action='profile_update',
            request=request,
            details={'updated_fields': list(request.data.keys())}
        )
        
        return response


class PasswordChangeView(APIView):
    """Password change endpoint"""
    
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        serializer = PasswordChangeSerializer(
            data=request.data,
            context={'request': request}
        )
        
        if serializer.is_valid():
            serializer.save()
            
            # Log password change
            log_user_activity(
                user=request.user,
                action='password_change',
                request=request,
                success=True
            )
            
            return Response({
                'message': 'Password changed successfully'
            }, status=status.HTTP_200_OK)
        
        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )


class UserListView(generics.ListAPIView):
    """List all users (Admin only)"""
    
    serializer_class = UserListSerializer
    permission_classes = [IsDeptAdminOrSuperAdmin]
    
    def get_queryset(self):
        user = self.request.user
        
        if user.role == 'super_admin':
            # Super admin can see all users
            return User.objects.all().order_by('-date_joined')
        elif user.role == 'dept_admin':
            # Dept admin can see users in their department
            return User.objects.filter(
                department=user.department
            ).order_by('-date_joined')
        else:
            return User.objects.none()


class UserDetailView(generics.RetrieveUpdateDestroyAPIView):
    """User detail view (Admin only)"""
    
    serializer_class = UserProfileSerializer
    permission_classes = [IsDeptAdminOrSuperAdmin]
    
    def get_queryset(self):
        user = self.request.user
        
        if user.role == 'super_admin':
            return User.objects.all()
        elif user.role == 'dept_admin':
            return User.objects.filter(department=user.department)
        else:
            return User.objects.none()
    
    def destroy(self, request, *args, **kwargs):
        """Deactivate user instead of deleting"""
        instance = self.get_object()
        instance.is_active = False
        instance.save()
        
        # Log account deactivation
        log_user_activity(
            user=instance,
            action='account_deactivated',
            request=request,
            details={'deactivated_by': request.user.username}
        )
        
        return Response({
            'message': 'User account deactivated successfully'
        }, status=status.HTTP_200_OK)


class UserActivityLogView(generics.ListAPIView):
    """User activity logs (Super Admin only)"""
    
    serializer_class = UserActivityLogSerializer
    permission_classes = [IsSuperAdmin]
    
    def get_queryset(self):
        queryset = UserActivityLog.objects.all()
        
        # Filter by user if specified
        user_id = self.request.query_params.get('user_id')
        if user_id:
            queryset = queryset.filter(user_id=user_id)
        
        # Filter by action if specified
        action = self.request.query_params.get('action')
        if action:
            queryset = queryset.filter(action=action)
        
        # Filter by date range if specified
        start_date = self.request.query_params.get('start_date')
        end_date = self.request.query_params.get('end_date')
        if start_date:
            queryset = queryset.filter(timestamp__gte=start_date)
        if end_date:
            queryset = queryset.filter(timestamp__lte=end_date)
        
        return queryset.order_by('-timestamp')


class DepartmentListView(generics.ListCreateAPIView):
    """Department list and create"""
    
    queryset = Department.objects.filter(is_active=True)
    serializer_class = DepartmentSerializer
    permission_classes = [IsSuperAdmin]


class DepartmentDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Department detail view"""
    
    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer
    permission_classes = [IsSuperAdmin]


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def dashboard_data(request):
    """Get dashboard data based on user role"""
    
    user = request.user
    data = {
        'user': UserProfileSerializer(user).data,
        'role_specific_data': {}
    }
    
    if user.role == 'super_admin':
        # Super Admin dashboard data
        data['role_specific_data'] = {
            'total_users': User.objects.count(),
            'active_users': User.objects.filter(is_active=True).count(),
            'total_departments': Department.objects.filter(is_active=True).count(),
            'recent_activities': UserActivityLogSerializer(
                UserActivityLog.objects.all()[:10], many=True
            ).data,
            'user_role_distribution': {
                'super_admin': User.objects.filter(role='super_admin').count(),
                'dept_admin': User.objects.filter(role='dept_admin').count(),
                'faculty': User.objects.filter(role='faculty').count(),
                'student': User.objects.filter(role='student').count(),
            }
        }
    
    elif user.role == 'dept_admin':
        # Department Admin dashboard data
        dept_users = User.objects.filter(department=user.department)
        data['role_specific_data'] = {
            'department_users': dept_users.count(),
            'active_department_users': dept_users.filter(is_active=True).count(),
            'faculty_count': dept_users.filter(role='faculty').count(),
            'student_count': dept_users.filter(role='student').count(),
            'recent_department_activities': UserActivityLogSerializer(
                UserActivityLog.objects.filter(user__department=user.department)[:10],
                many=True
            ).data,
        }
    
    elif user.role == 'faculty':
        # Faculty dashboard data
        data['role_specific_data'] = {
            'department': user.get_department_display(),
            'message': 'Welcome to Faculty Dashboard',
            'quick_actions': [
                'View Schedule',
                'Manage Classes',
                'Student Reports'
            ]
        }
    
    elif user.role == 'student':
        # Student dashboard data
        data['role_specific_data'] = {
            'department': user.get_department_display(),
            'message': 'Welcome to Student Dashboard',
            'quick_actions': [
                'View Schedule',
                'Course Registration',
                'Grades'
            ]
        }
    
    return Response(data, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def health_check(request):
    """Health check endpoint"""
    return Response({
        'status': 'healthy',
        'timestamp': timezone.now(),
        'version': '1.0.0'
    }, status=status.HTTP_200_OK)