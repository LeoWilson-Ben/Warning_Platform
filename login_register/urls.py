from django.urls import path
from . import views
from django.contrib.auth import views as auth_views
app_name = 'login_register'


urlpatterns = [
    path('register/', views.register_view, name='register'),
    path('login/', views.login_view, name='login'),
    path('captcha/', views.captcha_view, name='captcha'),
    path('logout/', views.logout_view, name='logout'),
    path('change_password/', views.change_password_view, name='change_password'),
]