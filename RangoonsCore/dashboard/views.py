from django.http import JsonResponse
from decouple import config

def debug_env(request):
    return JsonResponse({
        "SECRET_KEY": config('SECRET_KEY', default='Not Found'),
        "DEBUG": config('DEBUG', default='Not Found'),
        "ALLOWED_HOSTS": config('ALLOWED_HOSTS', default='Not Found'),
    })
