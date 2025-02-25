cat > ~/huobz/backend/urls.py <<EOF
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('dashboard/', include('dashboard.urls')),
    path('mobile-app/', include('mobile_app.urls')),
    path('website/', include('website.urls')),
]
EOF
