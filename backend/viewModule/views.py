from django.shortcuts import render
from django.http import HttpResponse
import csv
# This page handles requests by individual "view" functions
# TODO - import django module to serve json
# TODO - wire db/serve from csv

# (lat, long) x1, y1 -> NE and x2, y2 -> SW corner points
def coord(request, x1=int(0), y1=int(0), x2=int(0), y2=int(0)):
    csv_f = open('TRI_2018_US.csv', 'r')
    reader_data = csv.reader(csv_f)
    data_list = []
    for line in reader_data:
        data_list.append(line)
    lat_out = []
    long_out = []
    for x in range(1, 101):
        if(data_list[x][11] > x1 and data_list[x][12] < y1 and data_list[x][11] < x2 and data_list[x][12] > y2):
            lat_out.append(data_list[x][11])
            long_out.append(data_list[x][12])

    return HttpResponse('<h2> {} </h2>'.format(str(lat_out)))

def demo(request, tri_attr=int(-9999)):
    if tri_attr == -9999:
        return HttpResponse('<h1>No attribute requested</h1>')
    else:
        return HttpResponse('<h1>TRI data for attribute # {}</h1>'.format(tri_attr))

# if request.method== 'GET': #filter request types my method attr
# return HttpResponseNotFound(...) #returns 404
# by using annot. @require_http_methods improper request returns 405 (not allowed)
# @cache_page(900) for readability and performance - per view cache