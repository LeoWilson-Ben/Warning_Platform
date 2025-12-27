from django import forms
from django.core.exceptions import ValidationError
from .models import User
from django.contrib.auth.hashers import check_password
from django_redis import get_redis_connection

class RegisterForm(forms.Form):
    username = forms.CharField(
        label='用户名',
        max_length=20,
        min_length=3,
        error_messages={
            "required": "用户名不能为空",
            "min_length": "用户名最少为3个字",
            "max_length": "用户名不能超过20个字",
        }
    )

    email = forms.EmailField(
        label='邮箱',
        error_messages={
            "required": "邮箱不能为空",
            "invalid": "请输入有效的邮箱地址",
        }
    )

    password1 = forms.CharField(
        label='密码',
        min_length=6,
        error_messages={
            "required": "密码不能为空",
            "min_length": "密码至少6位",
        }
    )

    password2 = forms.CharField(
        label='确认密码',
        error_messages={
            "required": "请再次输入密码",
        }
    )

    email_code = forms.CharField(
        label='验证码',
        max_length=4,
        min_length=4,
        error_messages={
            "required": "验证码不能为空",
            "max_length": "验证码必须是4位数字",
            "min_length": "验证码必须是4位数字",
        }
    )

    def clean_username(self):
        username = self.cleaned_data['username']
        if User.objects.filter(username=username).exists():
            raise ValidationError("用户名已存在")
        return username

    def clean_email(self):
        email = self.cleaned_data['email']
        if User.objects.filter(email=email).exists():
            raise ValidationError("该邮箱已被注册")
        return email

    def clean(self):
        cleaned_data = super().clean()
        pwd1 = cleaned_data.get('password1')
        pwd2 = cleaned_data.get('password2')
        if pwd1 and pwd2 and pwd1 != pwd2:
            raise ValidationError("两次输入的密码不一致")

    def clean_email_code(self):
        code = self.cleaned_data['email_code']
        email = self.cleaned_data['email']

        # 连接redis
        redis_con = get_redis_connection('default')
        redis_key = f'verify_code:{email}'
        real_code = redis_con.get(redis_key)
        if not real_code:
            raise forms.ValidationError('验证码已过期！')
        real_code = real_code.decode()
        if code != real_code:
            raise forms.ValidationError('验证码错误！')
        redis_con.delete(redis_key)
        return code


class LoginForm(forms.Form):
    email = forms.EmailField(label='邮箱')
    password = forms.CharField(label='密码', max_length=128)

    def clean(self):
        cleaned_data = super().clean()
        email = cleaned_data.get('email')  # ✅ 取用户输入的 email
        password = cleaned_data.get('password')

        if not email or not password:
            raise ValidationError("请填写完整信息")

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            raise ValidationError("邮箱未注册！")

        if not check_password(password, user.password):
            print(password, user.password)
            raise ValidationError("密码错误！")

        # 如果验证通过，将 user 附加给表单对象
        self.user = user
        return cleaned_data


