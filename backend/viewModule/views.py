from django.shortcuts import render
from django.http import HttpResponse
# This page handles requests by individual "view" functions
# TODO - import django module to serve json
# TODO - wire db/serve from csv

def demo(request, tri_attr=int(-9999)):
    if tri_attr == -9999:
        return HttpResponse('<h1>No attribute requested</h1>')
    else:
        return HttpResponse('<h1>TRI data for attribute # {}</h1>'.format(tri_attr))

# if request.method== 'GET': #filter request types my method attr
# return HttpResponseNotFound(...) #returns 404
# by using annot. @require_http_methods improper request returns 405 (not allowed)
# @cache_page(900) for readability and performance - per view cache