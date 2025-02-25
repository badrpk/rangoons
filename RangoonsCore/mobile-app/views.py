from django.http import JsonResponse

def mobile_app_example(request):
    return JsonResponse({'message': 'Mobile App Module Working!'})
