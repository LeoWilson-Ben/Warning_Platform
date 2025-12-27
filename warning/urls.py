from django.urls import path
from . import views
app_name = 'warning'

urlpatterns = [
    path('', views.index, name='index'),
]