import os

from django.contrib.auth import get_user_model
from django.contrib.auth.models import AbstractUser
from django.db import models


def generate_salt():
    return os.urandom(32).hex()


class SystemUser(AbstractUser):
    salt = models.CharField(
        max_length=64,
        help_text="Unique salt for password hashing",
        default=generate_salt,
        editable=False,
    )


class Tag(models.Model):
    name = models.CharField(max_length=50, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)

    user = models.ForeignKey(
        get_user_model(),
        on_delete=models.CASCADE,
    )

    def __str__(self):
        return self.name
