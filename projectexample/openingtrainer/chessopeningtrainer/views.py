from django.shortcuts import render, get_object_or_404
from django.http import HttpResponse
from chessopeningtrainer.models import Opening
from django.shortcuts import redirect

def opening_list(request):
    openings = Opening.objects.all()
    return render(request, 'opening_list.html', {'openings': openings})

def opening_detail(request, opening_id):
    opening = get_object_or_404(Opening, pk=opening_id)
    return render(request, 'opening_detail.html', {'opening': opening})

def opening_redirect(request):
    return redirect('/openings/')
# Create your views here.
