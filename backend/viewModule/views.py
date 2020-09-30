# This page handles requests by individual "view" functions
from django.shortcuts import render
from django.http import HttpResponse, JsonResponse
from rest_framework.renderers import JSONRenderer
from django.db.models import Q
from viewModule.models import Tri2018 as tri
from viewModule.serializers import Tri2018Serializer as t_szr
from django.core import serializers as szs

# NOTE - use limiters [:5] (first 5) to truncate result
# view to get entry based on id
def idview(request):
    p_id = int(request.GET.get('id'))
    result = tri.objects.get(id=p_id)
    serializer = t_szr(result)
    return JsonResponse(serializer.data) # no need to set safe to false since dict is returned (1 entry)

def chemview(request):
    p_chem = str(request.GET.get('chemical'))
    resultset = tri.objects.filter(chemical=p_chem)[:10]
    data = szs.serialize('json', resultset) # django core sz for queryset
    return JsonResponse(data, safe=False)

def points(request):
    # UC ex: tri.objects.filter(
    # Q(latitude__lt=30.7)&Q(latitude__gt=30.6)&Q(longitude__lt=-96.3)&Q(longitude__gt=-96.5))
    ne_lat = float(request.GET.get('ne_lat', default=0.0))
    ne_lng = float(request.GET.get('ne_lng', default=0.0))
    sw_lat = float(request.GET.get('sw_lat', default=0.0))
    sw_lng = float(request.GET.get('sw_lng', default=0.0))
    data = szs.serialize('json',tri.objects.filter(Q(latitude__lt=ne_lat)&Q(latitude__gt=sw_lat)
                                                   &Q(longitude__lt=ne_lng)&Q(longitude__gt=sw_lng)))
    return HttpResponse(data, content_type='application/json')

def demo(request, tri_attr=int(-9999)):
    if tri_attr == -9999:
        return HttpResponse('<h1>No attribute requested</h1>')
    else:
        return HttpResponse('<h1>TRI data for attribute # {}</h1>'.format(tri_attr))

# if request.method== 'GET': #filter request types my method attr
# by using annot. @require_http_methods improper request returns 405 (not allowed)
# more on complex queries via Q objects - Field lookups
# - https://docs.djangoproject.com/en/3.1/ref/models/querysets/#field-lookups