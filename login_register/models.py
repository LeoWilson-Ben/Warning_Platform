from django.db import models
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin
# Create your models here.

from django.core.validators import MinLengthValidator, EmailValidator

class User(AbstractBaseUser, PermissionsMixin):
    username = models.CharField(
        max_length=150,
        unique=True,
        validators=[MinLengthValidator(3)],
        verbose_name="用户名"
    )
    email = models.EmailField(
        unique=True,
        validators=[EmailValidator()],
        verbose_name="邮箱"
    )
    password = models.CharField(
        max_length=128,  # Django默认密码字段长度
        validators=[MinLengthValidator(6)],
        verbose_name="密码"
    )
    last_login = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name="最近登录时间"
    )
    is_staff = models.BooleanField(default=False)  # 必须
    is_superuser = models.BooleanField(default=False)  # 必须
    is_active = models.BooleanField(default=True)

    USERNAME_FIELD = 'email'  # 必须字段：用于身份验证的字段
    REQUIRED_FIELDS = ['username']