from django.utils import timezone
from django.shortcuts import render,redirect,reverse
from django_redis import get_redis_connection
from django.http.response import JsonResponse
from django.core.mail import send_mail
from django.conf import settings
import random
from .forms import LoginForm,RegisterForm
from .models import User
# Create your views here.
from django.contrib.auth import get_user_model, login, logout
from django.contrib.auth.hashers import make_password
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.views.decorators.http import require_POST
import json

def register_view(request):
    if request.method == 'POST':
        form = RegisterForm(request.POST)
        print("验证失败原因：", form.errors)
        if form.is_valid():
            User.objects.create(
                username=form.cleaned_data['username'],
                email=form.cleaned_data['email'],
                password=make_password(form.cleaned_data['password1'])
            )
            print('注册成功！')
            return redirect(reverse('login_register:login'))
        else:
            error = next(iter(form.errors.values()))
            return render(request, 'register.html', {'error': error})
    else:

        return render(request,'register.html')
def login_view(request):
    if request.method == 'POST':
        form = LoginForm(request.POST)
        print("验证失败原因：", form.errors)

        if form.is_valid():
            user = form.user
            user.last_login = timezone.now()

            user.save()
            login(request, user)
            print(f"用户 {user.email} 已登录，is_authenticated: {request.user.is_authenticated}")
            request.session.set_expiry(60*60*24)
            return redirect(reverse('warning:index'))
        else:
            error = next(iter(form.errors.values()))
            return render(request,'login.html',{'error':error})
    else:

        return render(request,'login.html')


def captcha_view(request):
    email = request.GET.get('email')
    if not email:
        return JsonResponse({'code': 400,"message":"必须是邮箱！"})
    #生成4位验证码
    digits_str = ''.join(map(str, random.sample(range(10), 4)))

    # 连接 Redis
    redis_conn = get_redis_connection('default')

    # 存储验证码到 Redis，使用手机号作为键
    redis_key = f'verify_code:{email}'
    redis_conn.setex(redis_key, settings.SMS_CODE_REDIS_EXPIRES, digits_str)

    # 实际项目中这里会发送短信，这里仅打印验证码用于测试
    print(f"验证码: {digits_str}")


    send_mail(f"🔋电池健康状态预测预警平台：注册验证码{digits_str}",f"注册验证码：{digits_str}",recipient_list=[email],from_email=None)

    return JsonResponse({"code":200,"message":"验证码发送成功"})

def logout_view(request):
    logout(request)  # 清除用户会话
    return redirect('login_register:login')  # 登出后重定向到登录页


@login_required
def change_password_view(request):
    if request.method == 'POST':
        old_password = request.POST.get('old_password')
        new_password = request.POST.get('new_password')
        user = request.user
        if user.check_password(old_password):
            print("检查点")
            user.set_password(new_password)
            user.save()
            return JsonResponse({'success': True})
        else:
            return JsonResponse({'success': False, 'message': '原密码错误'}, status=400)
    else:
        return render(request,'password_change.html')
