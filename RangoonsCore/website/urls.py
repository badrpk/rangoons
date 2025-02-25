from django.urls import path
from . import views

urlpatterns = [
    path('example/', views.website_example, name='website_example'),
]
