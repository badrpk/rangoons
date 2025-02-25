from django.urls import path
from . import views

urlpatterns = [
    path('example/', views.mobile_app_example, name='mobile_app_example'),
]
