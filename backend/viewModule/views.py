# This page handles requests by individual "view" functions
from django.http import HttpResponse, JsonResponse, HttpResponseBadRequest
from rest_framework.response import Response
from django.db.models import Q, Sum, Subquery, Count, Avg
from viewModule.models import Tri as tri
from viewModule.models import Facility as facility
from viewModule.models import Chemical as chemical
from viewModule.models import Release as release
from viewModule.serializers import TriSerializer as t_szr
from django.core import serializers as szs
from django.core.serializers.json import DjangoJSONEncoder
import json
import re

latest_year = 2019

# SAMPLE coords-> ?ne_lat=13.3950&sw_lat=13.3948&sw_lng=144.7070&ne_lng=144.7072 {Yields 6 records in GUAM}

def health_check(request):
    return HttpResponse('OK')

def geoFilter(request):
    state = request.GET.get('state')
    county = request.GET.get('county')
    city = request.GET.get('city')

    filters = Q()

    if state is not None:
        filters.add(Q(facility__state=state.upper()), filters.connector)
    
    if county is not None:
        filters.add(Q(facility__county=county.upper()), filters.connector)

    if city is not None:
        filters.add(Q(facility__city=city.upper()), filters.connector)

    return filters

def filterFacilities(request):
    carcinogen = request.GET.get('carcinogen')
    dioxin = request.GET.get('dioxin')
    pbt = request.GET.get('pbt')
    chemical = request.GET.get('chemical')
    release_type = request.GET.get('release_type')

    filters = Q()

    # filter by release_type
    if release_type is not None:
        if release_type.lower() == 'air':
            filters.add(Q(release__air__gt=0), filters.connector)
        elif release_type.lower() == 'water':
            filters.add(Q(release__water__gt=0), filters.connector)
        elif release_type.lower() == 'land':
            filters.add(Q(release__land__gt=0), filters.connector)
        elif release_type.lower() == 'on_site':
            filters.add(Q(release__on_site__gt=0), filters.connector)
        elif release_type.lower() == 'off_site':
            filters.add(Q(release__off_site__gt=0), filters.connector)

    # filter by chemicals
    if chemical is not None and chemical != "all":
        filters.add(Q(chemical__name__icontains=chemical), filters.connector)

    # filter by carcinogens, PBTs, or dioxins only
    if carcinogen is not None:
        filters.add(Q(chemical__carcinogen='YES'), filters.connector)
    elif dioxin is not None:
        filters.add(Q(chemical__classification='Dioxin'), filters.connector)
    elif pbt is not None:
        filters.add(Q(chemical__classification='PBT'), filters.connector)

    return filters


def filterChemicals(request):
    carcinogen = request.GET.get('carcinogen')
    dioxin = request.GET.get('dioxin')
    pbt = request.GET.get('pbt')
    chemical = request.GET.get('chemical')
    release_type = request.GET.get('release_type')

    filters = Q()

    # filter by release_type
    if release_type is not None:
        if release_type.lower() == 'air':
            filters.add(Q(release__air__gt=0), filters.connector)
        elif release_type.lower() == 'water':
            filters.add(Q(release__water__gt=0), filters.connector)
        elif release_type.lower() == 'land':
            filters.add(Q(release__land__gt=0), filters.connector)
        elif release_type.lower() == 'on_site':
            filters.add(Q(release__on_site__gt=0), filters.connector)
        elif release_type.lower() == 'off_site':
            filters.add(Q(release__off_site__gt=0), filters.connector)

    # filter by chemicals
    if chemical is not None and chemical != "all":
        filters.add(Q(name__icontains=chemical), filters.connector)

    # filter by carcinogens, PBTs, or dioxins only
    if carcinogen is not None:
        filters.add(Q(carcinogen='YES'), filters.connector)
    elif dioxin is not None:
        filters.add(Q(classification='Dioxin'), filters.connector)
    elif pbt is not None:
        filters.add(Q(classification='PBT'), filters.connector)

    return filters


def filterReleases(request):
    carcinogen = request.GET.get('carcinogen')
    dioxin = request.GET.get('dioxin')
    pbt = request.GET.get('pbt')
    chemical = request.GET.get('chemical')
    release_type = request.GET.get('release_type')

    filters = Q(total__gt=0)

    # filter by release_type
    if release_type is not None:
        if release_type.lower() == 'air':
            filters.add(Q(air__gt=0), filters.connector)
        elif release_type.lower() == 'water':
            filters.add(Q(water__gt=0), filters.connector)
        elif release_type.lower() == 'land':
            filters.add(Q(land__gt=0), filters.connector)
        elif release_type.lower() == 'on_site':
            filters.add(Q(on_site__gt=0), filters.connector)
        elif release_type.lower() == 'off_site':
            filters.add(Q(off_site__gt=0), filters.connector)

    # filter by chemicals
    if chemical is not None and chemical != "all":
        filters.add(Q(chemical__name__icontains=chemical), filters.connector)

    # filter by carcinogens, PBTs, or dioxins only
    if carcinogen is not None and str(carcinogen).lower() == 'true':
        filters.add(Q(chemical__carcinogen='YES'), filters.connector)
    elif dioxin is not None:
        filters.add(Q(chemical__classification='Dioxin'), filters.connector)
    elif pbt is not None:
        filters.add(Q(chemical__classification='PBT'), filters.connector)
    return filters


def testgeoFilter(request):
    #state = str(request.GET.get('state')).upper()
    #qs = release.objects.filter(Q(release__year=2014))[:5]
    #y = request.GET.get('year')
    qs = release.objects.filter(geoFilter(request))[:5]
    print(qs.query)
    #qs = release.objects.filter(Q(facility__state=state) & Q(year=y))[:5]
    return HttpResponse(szs.serialize('json', qs), content_type='application/json')

""" Returns list of facilties filtered by geographic window, year, release type, and chemical classification."""
def get_facilities(request):
    state = request.GET.get('state')
    county = request.GET.get('county')
    city = request.GET.get('city')
    filters = Q()

    if state is None:
        return HttpResponseBadRequest()

    if state is not None:
        filters.add(Q(state=state.upper()), filters.connector)
    
    if county is not None:
        filters.add(Q(county=county.upper()), filters.connector)

    if city is not None:
        filters.add(Q(city=city.upper()), filters.connector)

    y = int(request.GET.get('year', default=latest_year))

    # add sum of total releases for the facility with these filters
    raw = facility.objects.filter(filters & Q(release__year=y) & filterFacilities(request)).distinct().annotate(
        total=Sum('release__total')).values()
    response = json.dumps(list(raw), cls=DjangoJSONEncoder)
    return HttpResponse(response, content_type='application/json')

''' '''
def get_chemicals(request, facility_id):
    y = int(request.GET.get('year', default=latest_year))
    filters = Q(facilities__id=facility_id) & Q(release__year=y)
    filters.add(filterChemicals(request), filters.connector)
    raw = chemical.objects.filter(filters).values().annotate(
        total=Sum('release__total'))
    response = json.dumps(list(raw), cls=DjangoJSONEncoder)
    return HttpResponse(response, content_type='application/json')

''' '''
def get_chemicals_in_window(request):
    state = request.GET.get('state')
    if state is None:
        return HttpResponseBadRequest()
    y = int(request.GET.get('year', default=latest_year))
    raw = release.objects.filter(geoFilter(request) & filterReleases(request) & Q(year=y)).values('chemical__name').order_by('chemical__name').distinct()
    response = json.dumps([x['chemical__name'] for x in raw], cls=DjangoJSONEncoder)
    return HttpResponse(response, content_type='application/json')

''' Return total stats released by state & year {graph }'''
def state_total_releases(request):
    state = request.GET.get('state')
    if state is None:
        return HttpResponseBadRequest()
    y = int(request.GET.get('year', default=latest_year))
    t_dioxin, t_carc, t_onsite, t_air, t_water, t_land, t_offsite, t_facilitycount = 0, 0, 0, 0, 0, 0, 0, 0
    result = {}
    if y != 'None':
        queryset = release.objects.filter(geoFilter(request) & Q(year=y))
        t_facilitycount = int(release.objects.filter(geoFilter(request) & Q(year=y)).values('facility').distinct().count())
        for q in queryset:
            if q.chemical.carcinogen == 'YES':
                t_carc += q.total
            if q.chemical.classification == 'Dioxin':
                t_dioxin += q.total
                t_onsite += q.on_site
                t_offsite += q.off_site
                t_air += q.air
                t_water += q.water
                t_land += q.land

        result = {'totalonsite': t_onsite, 'air': t_air, 'water': t_water, 'land': t_land,
                  'totaloffsite': t_offsite, 'totaldioxin': t_dioxin, 'totalcarcs': t_carc,
                  'numtrifacilities': t_facilitycount}
        return JsonResponse(result)

''' RM '''
def all_state_total_releases(request):
    y = int(request.GET.get('year', default=latest_year))
    carcinogen = request.GET.get('carcinogen')
    dioxin = request.GET.get('dioxin')
    pbt = request.GET.get('pbt')
    chemical = request.GET.get('chemical')

    filters = Q()

    #queryset = release.objects.filter(filterReleases(request) & Q(year=y)).values('facility__parent_co_name')

    queryset = release.objects.filter(filterReleases(request) & Q(year=y)).values('facility__state').annotate(total=Sum('total')).annotate(air=Sum('air')).annotate(water=Sum(
        'water')).annotate(land=Sum('land')).annotate(off_site=Sum('off_site')).annotate(on_site=Sum('on_site')).annotate(num_facilities=Count('facility__id')).order_by('facility__state')
    #response = json.dumps(list(raw), cls=DjangoJSONEncoder)

    return JsonResponse(list(queryset[:10]), content_type='application/json', safe=False)
    #return HttpResponse(response, content_type='application/json')

''' Returns releases by county and state'''
def all_county_total_releases(request):
    state = request.GET.get('state')
    filters = Q()
    if state is None:
        return HttpResponseBadRequest()
    if state is not None:
        filters = Q(facility__state=state.upper())
    y = int(request.GET.get('year', default=latest_year))
    raw = release.objects.filter(filters & Q(year=y)).values('facility__county', 'facility__state').annotate(total=Sum('total')).annotate(air=Sum('air')).annotate(water=Sum(
        'water')).annotate(land=Sum('land')).annotate(off_site=Sum('off_site')).annotate(on_site=Sum('on_site')).annotate(num_facilities=Count('facility__id')).order_by('facility__county')
    response = json.dumps(list(raw), cls=DjangoJSONEncoder)
    return HttpResponse(response, content_type='application/json')


''' Returns all chemicals and respective total release (by type) amounts for queried location {Graph 13} '''
def all_chemicals_releases(request):
    state = request.GET.get('state')
    if state is None:
        return HttpResponseBadRequest()
    y = int(request.GET.get('year', default=latest_year))
    qs = release.objects.filter(geoFilter(request) & Q(year=y)).values('chemical__name').annotate(
        Sum('air'), Sum('water'), Sum('land'), Sum('off_site')).order_by('chemical__name')
    # print(qs.query)
    return JsonResponse(list(qs), content_type='application/json', safe=False)


''' Returns all chemicals and respective total release (not by type / only total) amounts in queried location {Graph 15} '''
def all_chemicals_total_releases(request):
    state = request.GET.get('state')
    if state is None:
        return HttpResponseBadRequest()
    y = int(request.GET.get('year', default=latest_year))
    # TODO - adding an order_by('-total') introduces duplicate chemical names
    qs = release.objects.filter(geoFilter(request) & Q(year=y)).values('chemical__name').annotate(Sum('total')).order_by('chemical__name')
    #print(qs.query)
    return JsonResponse(list(qs), content_type='application/json', safe=False)


''' Returns all facilities and respective total release (by type) amounts in queried location {Graph 12} '''
def all_facility_releases(request):
    state = request.GET.get('state')
    if state is None:
        return HttpResponseBadRequest()
    y = int(request.GET.get('year', default=latest_year))
    qs = release.objects.filter(geoFilter(request) & Q(year=y)).values(
        'facility__name').annotate(
        Sum('air'), Sum('water'), Sum('land'), Sum('off_site')).order_by('facility__name')
    # print(qs.query)
    return JsonResponse(list(qs), content_type='application/json', safe=False)


''' Returns all facilities and respective total release (not by type / only total) amounts in queried location {Graph 14} '''
def all_facility_total_releases(request):
    state = request.GET.get('state')
    if state is None:
        return HttpResponseBadRequest()
    y = int(request.GET.get('year', default=latest_year))
    qs = release.objects.filter(geoFilter(request) & Q(year=y)).values('facility__name').annotate(Sum('total')).order_by('-total').order_by('facility__name')
    #print(qs.query)
    return JsonResponse(list(qs), content_type='application/json', safe=False)


''' Return top 10 companies in total releases by geo window & year'''
def top_parentco_releases(request):
    state = request.GET.get('state')
    if state is None:
        return HttpResponseBadRequest()
    carcinogen = request.GET.get('carcinogen')
    dioxin = request.GET.get('dioxin')
    pbt = request.GET.get('pbt')
    chemical = request.GET.get('chemical')
    y = int(request.GET.get('year', default=latest_year))
    release_type = request.GET.get('release_type', default='all').upper()
    queryset = release.objects.filter(filterReleases(request) &
                                      geoFilter(request) & Q(year=y)).values('facility__parent_co_name')

    filters = Q()

        # filter by chemicals
    if chemical is not None and chemical != "all":
        filters.add(Q(chemical__name__icontains=chemical), filters.connector)
    # filter by carcinogens, PBTs, or dioxins only

    if carcinogen is not None:
        filters.add(Q(chemical__carcinogen='YES'), filters.connector)
    elif dioxin is not None:
        filters.add(Q(chemical__classification='Dioxin'), filters.connector)
    elif pbt is not None:
        filters.add(Q(chemical__classification='PBT'), filters.connector)

        queryset = release.objects.filter(filters &
                                          geoFilter(request) & Q(year=y)).values('facility__name')

    if release_type == 'AIR':
        queryset = queryset.annotate(total=Sum('air')).order_by('-total')
    elif release_type == 'WATER':
        queryset = queryset.annotate(total=Sum('water')).order_by('-total')
    elif release_type == 'LAND':
        queryset = queryset.annotate(total=Sum('land')).order_by('-total')
    elif release_type == 'ON_SITE':
        queryset = queryset.annotate(
            total=Sum('on_site')).order_by('-total')
    elif release_type == 'OFF_SITE':
        queryset = queryset.annotate(
            total=Sum('off_site')).order_by('-total')
    else:
        queryset = queryset.annotate(total=Sum('total')).annotate(air=Sum('air')).annotate(water=Sum('water')).annotate(
            land=Sum('land')).annotate(on_site=Sum('on_site')).annotate(off_site=Sum('off_site')).order_by('-total')
    return JsonResponse(list(queryset[:10]), content_type='application/json', safe=False)


''' Return top ten polluting facilities over time by: window'''
def timeline_top_parentco_releases(request):
    state = request.GET.get('state')
    if state is None:
        return HttpResponseBadRequest()
    parents = list(release.objects.filter(geoFilter(request) & filterReleases(request) & Q(year=latest_year)).values_list(
        'facility__parent_co_name', flat=True).annotate(total=Sum('total')).order_by('-total'))[:10]
    response = release.objects.filter(geoFilter(request) & filterReleases(request) & Q(facility__parent_co_name__in=parents)).values(
        'year', 'facility__parent_co_name').order_by('facility__parent_co_name', 'year').annotate(total=Sum('total'))
    return HttpResponse(json.dumps(list(response), cls=DjangoJSONEncoder), content_type='application/json')


""" Returns the total releases (in lbs) in a location for each available year. """
def timeline_total(request):
    state = request.GET.get('state')
    if state is None:
        return HttpResponseBadRequest()
    queryset = release.objects.filter(geoFilter(request) & filterReleases(request)).values(
        'year').annotate(total=Sum('total')).order_by('year')
    response = json.dumps(list(queryset), cls=DjangoJSONEncoder)
    return HttpResponse(response, content_type='application/json')


''' Return top ten polluting facilities by geo spec. '''


def top_facility_releases(request):
    state = request.GET.get('state')
    if state is None:
        return HttpResponseBadRequest()
    carcinogen = request.GET.get('carcinogen')
    dioxin = request.GET.get('dioxin')
    pbt = request.GET.get('pbt')
    chemical = request.GET.get('chemical')
    all = int(request.GET.get('all', default=0))
    y = int(request.GET.get('year', default=latest_year))
    release_type = request.GET.get('release_type', default='all').upper()
    if all == 1:
        queryset = release.objects.filter(geoFilter(request) & filterReleases(request) & Q(year=y)).values('facility__name').annotate(total=Sum('on_site')).annotate(land=Sum('land')).annotate(
            air=Sum('air')).annotate(water=Sum('water')).annotate(vet_total_releases_offsite=Sum('off_site')).order_by('-total')
    else:
        filters = Q()

        # filter by chemicals
        if chemical is not None and chemical != "all":
            filters.add(Q(chemical__name__icontains=chemical), filters.connector)

        # filter by carcinogens, PBTs, or dioxins only
        if carcinogen is not None:
            filters.add(Q(chemical__carcinogen='YES'), filters.connector)
        elif dioxin is not None:
            filters.add(Q(chemical__classification='Dioxin'), filters.connector)
        elif pbt is not None:
            filters.add(Q(chemical__classification='PBT'), filters.connector)

        queryset = release.objects.filter(filters &
                                          geoFilter(request) & Q(year=y)).values('facility__name')

        if release_type == 'AIR':
            queryset = queryset.annotate(total=Sum('air')).order_by('-total')
        elif release_type == 'WATER':
            queryset = queryset.annotate(total=Sum('water')).order_by('-total')
        elif release_type == 'LAND':
            queryset = queryset.annotate(total=Sum('land')).order_by('-total')
        elif release_type == 'ON_SITE':
            queryset = queryset.annotate(
                total=Sum('on_site')).order_by('-total')
        elif release_type == 'OFF_SITE':
            queryset = queryset.annotate(
                total=Sum('off_site')).order_by('-total')
        else:
            queryset = queryset.annotate(total=Sum('total')).annotate(air=Sum('air')).annotate(water=Sum('water')).annotate(
                land=Sum('land')).annotate(on_site=Sum('on_site')).annotate(off_site=Sum('off_site')).order_by('-total')

    return JsonResponse(list(queryset[:10]), content_type='application/json', safe=False)


''' Return top ten polluting facilities over time by: window'''
def timeline_top_facility_releases(request):
    state = request.GET.get('state')
    if state is None:
        return HttpResponseBadRequest()
    get_averages = bool(request.GET.get('averages'))
    release_list = release.objects.filter(geoFilter(request) & filterReleases(request) & Q(
        year=2018)).values('facility__id').annotate(total=Sum('total')).order_by('-total')
    top_facilities = [x['facility__id'] for x in release_list][:10]
    lines = release.objects.filter(geoFilter(request) & filterReleases(request) & Q(facility__id__in=top_facilities)).values(
        'year', 'facility__name').order_by('facility__name', 'year').annotate(total=Sum('total'))

    if(get_averages):
        averages = facility.objects.filter(Q(id__in=top_facilities)).values(
            'name').annotate(avg=Avg('release__total')).order_by('-avg')
    return HttpResponse(json.dumps({'averages': list(averages) if get_averages else None, 'lines': list(lines)}, cls=DjangoJSONEncoder), content_type='application/json')

''' Return timeline data for PBT chemicals'''
def timeline_top_pbt_chemicals(request):
    state = request.GET.get('state')
    if state is None:
        return HttpResponseBadRequest()
    chemicals = list(release.objects.filter(geoFilter(request) & filterReleases(request) & Q(year=latest_year) & Q(chemical__classification='PBT')).values_list(
        'chemical__id', flat=True).annotate(total=Sum('total')).order_by('-total'))[:10]
    response = release.objects.filter(geoFilter(request) & filterReleases(request) & Q(chemical__id__in=chemicals)).values(
        'year', 'chemical__name').order_by('chemical__name', 'year').annotate(total=Sum('total'))
    return HttpResponse(json.dumps(list(response), cls=DjangoJSONEncoder), content_type='application/json')

''' Returns number of facilities based on state -- UNUSED'''
def num_facilities(request):
    state = request.GET.get('state')
    if state is None:
        return HttpResponseBadRequest()
    data = facility.objects.filter(state=state).values('name').distinct().count()
    return HttpResponse(data, content_type='application/json')

''' Return summary points within window'''
def country_summary(request):
    state = request.GET.get('state')
    if state is None:
        return HttpResponseBadRequest()
    y = int(request.GET.get('year', default=latest_year))
    raw = release.objects.filter(Q(year=y)).aggregate(total=Sum(
        'total'), num_facilities=Count('facility__id', distinct=True), num_chemicals=Count('chemical__id', distinct=True),
        total_air=Sum('air'), total_water=Sum('water'), total_land=Sum('land'), total_on_site=Sum('on_site'), total_off_site=Sum('off_site'))
    raw['total_carcinogen'] = release.objects.filter(Q(year=y) & Q(
        chemical__carcinogen='YES')).aggregate(carcinogen=Sum('total'))['carcinogen']
    response = json.dumps(raw, cls=DjangoJSONEncoder)
    return HttpResponse(response, content_type='application/json')

''' Returns summary based on geo spec. '''
def location_summary(request):
    state = request.GET.get('state')
    if state is None:
        return HttpResponseBadRequest()
    y = int(request.GET.get('year', default=latest_year))
    raw = release.objects.filter(geoFilter(request) & Q(year=y)).aggregate(total=Sum(
        'total'), num_facilities=Count('facility__id', distinct=True), num_chemicals=Count('chemical__id', distinct=True),
        total_air=Sum('air'), total_water=Sum('water'), total_land=Sum('land'), total_on_site=Sum('on_site'), total_off_site=Sum('off_site'))
    raw['total_carcinogen'] = release.objects.filter(geoFilter(request) & Q(year=y) & Q(
        chemical__carcinogen='YES')).aggregate(carcinogen=Sum('total'))['carcinogen']
    response = json.dumps(raw, cls=DjangoJSONEncoder)
    return HttpResponse(response, content_type='application/json')

''' Returns amount released by each chemical within geo spec. '''
def top_chemicals(request):
    state = request.GET.get('state')
    if state is None:
        return HttpResponseBadRequest()
    y = int(request.GET.get('year', default=latest_year))
    raw = release.objects.filter(geoFilter(request) & filterReleases(request) & Q(year=y)).values(
        'chemical__name').annotate(total=Sum('total')).order_by('-total')[:10]
    return JsonResponse(list(raw), content_type='application/json', safe=False)


""" Returns the total release amount over time for the top 10 chemicals released in latest_year. """
def top_pbt_chemicals(request):
    state = request.GET.get('state')
    if state is None:
        return HttpResponseBadRequest()
    y = int(request.GET.get('year', default=latest_year))
    raw = release.objects.filter(geoFilter(request) & filterReleases(request) & Q(year=y) & Q(chemical__classification='PBT')).values(
        'chemical__name').annotate(total=Sum('total')).order_by('-total')[:10]
    return JsonResponse(list(raw), content_type='application/json', safe=False)


def timeline_top_chemicals(request):
    state = request.GET.get('state')
    if state is None:
        return HttpResponseBadRequest()
    chemicals = list(release.objects.filter(geoFilter(request) & filterReleases(request) & Q(year=latest_year)).values_list(
        'chemical__id', flat=True).annotate(total=Sum('total')).order_by('-total'))[:10]
    response = release.objects.filter(geoFilter(request) & filterReleases(request) & Q(chemical__id__in=chemicals)).values(
        'year', 'chemical__name').order_by('chemical__name', 'year').annotate(total=Sum('total'))
    return HttpResponse(json.dumps(list(response), cls=DjangoJSONEncoder), content_type='application/json')


def clean_chemical_name(str):
    pattern = re.compile(r'\([^)]*\)|compounds|\"| and.*', re.IGNORECASE)
    return pattern.sub("", str).strip()

#Is this function needed?
def attr(request, attribute=str()):
    attr = str(attribute).upper()
    if attr == 'ID':
        return idview(request)
    elif attr == 'CHEMICAL' or attr == 'CHEMICALS':
        return chemview(request)
    elif attr == 'CITY':
        return cityview(request)
    elif attr == 'ZIP':
        return zipview(request)


# - https://docs.djangoproject.com/en/3.1/ref/models/querysets/#field-lookups
