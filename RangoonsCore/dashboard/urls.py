from django.urls import path
from . import views

urlpatterns = [
    path('debug-env/', views.debug_env, name='debug_env'),
]
