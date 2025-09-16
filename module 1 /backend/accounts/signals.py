from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.contrib.auth.signals import user_logged_in, user_logged_out, user_login_failed
from .models import User, UserActivityLog
from .utils import log_user_activity


@receiver(post_save, sender=User)
def user_created_handler(sender, instance, created, **kwargs):
    """Handle user creation"""
    if created:
        # Log user creation (will be handled in the view for more context)
        pass


@receiver(user_logged_in)
def user_logged_in_handler(sender, request, user, **kwargs):
    """Handle successful user login"""
    # This is handled in the custom login view for better control
    pass


@receiver(user_logged_out)
def user_logged_out_handler(sender, request, user, **kwargs):
    """Handle user logout"""
    if user:
        log_user_activity(
            user=user,
            action='logout',
            request=request,
            success=True
        )


@receiver(user_login_failed)
def user_login_failed_handler(sender, credentials, request, **kwargs):
    """Handle failed login attempts"""
    username = credentials.get('username', 'unknown')
    
    try:
        user = User.objects.get(username=username)
    except User.DoesNotExist:
        user = None
    
    log_user_activity(
        user=user,
        action='failed_login',
        request=request,
        success=False,
        details={'username': username}
    )