from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('dashboard/', include('dashboard.urls')),  # Include dashboard app URLs
    path('huobz/', include('huobz.urls')),          # Include huobz app URLs
    path('website/', include('website.urls')),      # Include website app URLs
    path('mobile-app/', include('mobile_app.urls')), # Include mobile_app URLs
]
