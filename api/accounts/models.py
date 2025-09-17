from django.conf import settings
from django.db import models
from master_data.models import College


class UserProfile(models.Model):
    """Profile storing additional attributes for authentication/authorization."""
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="profile",
    )
    is_superadmin = models.BooleanField(default=False)
    is_admin = models.BooleanField(default=False)
    college = models.ForeignKey(College, on_delete=models.SET_NULL, null=True, blank=True, related_name="users")

    def __str__(self) -> str:
        return f"Profile<{self.user.username}>"
