cat > ~/huobz/website/views.py <<EOF
from django.http import JsonResponse

def index(request):
    return JsonResponse({'message': 'Welcome to the Website!'})
EOF
