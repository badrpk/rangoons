from django.http import JsonResponse

def website_example(request):
    return JsonResponse({'message': 'Website Module Working!'})
