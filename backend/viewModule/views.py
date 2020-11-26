# This page handles requests by individual "view" functions
from django.http import HttpResponse, JsonResponse
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

# Design Pattern - Use JsonResponse(...) for returning single item querysets or singular dictionary objects
#        Use HttpResponse(.., content_type=..) for returning querysets with multiple records

# Design Pattern - For selecting certain columns, specify in SERIALIZER(.., FIELDS=('...')) param.
#        and NOT IN ORM QUERY. If values() (and/or distinct()) is used in ORM query a <ValuesQuerySet>
#        is returned which is unusable by serializer, use json.dumps(list(..)) instead and return response

def health_check(request):
    return HttpResponse('OK')

def geoFilter(request):
    state = request.GET.get('state')
    county = request.GET.get('county')
    city = request.GET.get('city')
    #print(state, county, city)
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

    filters = Q()

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
    if carcinogen is not None:
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

"""
Returns list of facilties filtered by geographic window, year, release type, and chemical classification.
"""
def get_facilities(request):
    ne_lat = float(request.GET.get('ne_lat', default=0.0))
    ne_lng = float(request.GET.get('ne_lng', default=0.0))
    sw_lat = float(request.GET.get('sw_lat', default=0.0))
    sw_lng = float(request.GET.get('sw_lng', default=0.0))
    y = int(request.GET.get('year', default=latest_year))

    # filter by geographic window and year
    window = (Q(latitude__lt=ne_lat) & Q(latitude__gt=sw_lat)
              & Q(longitude__lt=ne_lng)
              & Q(longitude__gt=sw_lng))

    # add sum of total releases for the facility with these filters
    raw = facility.objects.filter(window & Q(release__year=y) & filterFacilities(request)).annotate(
        total=Sum('release__total')).values()
    response = json.dumps(list(raw), cls=DjangoJSONEncoder)
    return HttpResponse(response, content_type='application/json')


def get_chemicals(request, facility_id):
    y = int(request.GET.get('year', default=latest_year))
    filters = Q(facilities__id=facility_id) & Q(release__year=y)
    filters.add(filterChemicals(request), filters.connector)
    raw = chemical.objects.filter(filters).values().annotate(
        total=Sum('release__total'))
    response = json.dumps(list(raw), cls=DjangoJSONEncoder)
    return HttpResponse(response, content_type='application/json')


def get_chemicals_in_window(request):
    y = int(request.GET.get('year', default=latest_year))
    raw = release.objects.filter(geoFilter(request) & filterReleases(request) & Q(year=y)).values('chemical__name').distinct()
    response = json.dumps([x['chemical__name'] for x in raw], cls=DjangoJSONEncoder)
    return HttpResponse(response, content_type='application/json')


'''
Return total stats released by state & year {graph }
'''


# TODO
def state_total_releases(request):
    st = str(request.GET.get('state')).upper()
    y = int(request.GET.get('year', default=latest_year))
    t_dioxin, t_carc, t_onsite, t_air, t_water, t_land, t_offsite, t_facilitycount = 0, 0, 0, 0, 0, 0, 0, 0
    result = {}
    if st != 'None':
        queryset = release.objects.filter(facility__state=st, year=y)
        t_facilitycount = int(release.objects.filter(
            facility__state=st, year=y).values('facility').distinct().count())
        for q in queryset:
            if q.chemical.classification == 'Dioxin':
                t_dioxin += q.total
                if q.chemical.carcinogen == 'YES':
                    t_carc += q.total
            else:
                if q.chemical.carcinogen == 'YES':
                    t_carc += q.total
                t_onsite += q.on_site
                t_offsite += q.off_site
                t_air += q.air
                t_water += q.water
                t_land += q.land

        result = {'totalonsite': t_onsite, 'air': t_air, 'water': t_water, 'land': t_land,
                  'totaloffsite': t_offsite, 'totaldioxin': t_dioxin, 'totalcarcs': t_carc,
                  'numtrifacilities': t_facilitycount}
        return JsonResponse(result)



def all_state_total_releases(request):
    y = int(request.GET.get('year', default=latest_year))
    raw = release.objects.filter(year=y).values('facility__state').annotate(total=Sum('total')).annotate(air=Sum('air')).annotate(water=Sum(
        'water')).annotate(land=Sum('land')).annotate(off_site=Sum('off_site')).annotate(on_site=Sum('on_site')).annotate(num_facilities=Count('facility__id')).order_by('facility__state')
    print(len(raw))
    response = json.dumps(list(raw), cls=DjangoJSONEncoder)
    return HttpResponse(response, content_type='application/json')


def all_county_total_releases(request):
    y = int(request.GET.get('year', default=latest_year))
    raw = release.objects.filter(year=y).values('facility__county', 'facility__state').annotate(total=Sum('total')).annotate(air=Sum('air')).annotate(water=Sum(
        'water')).annotate(land=Sum('land')).annotate(off_site=Sum('off_site')).annotate(on_site=Sum('on_site')).annotate(num_facilities=Count('facility__id')).order_by('facility__county')
    print(len(raw))
    response = json.dumps(list(raw), cls=DjangoJSONEncoder)
    return HttpResponse(response, content_type='application/json')


''' Returns all chemicals and respective total release (by type) amounts for queried location {Graph 13} '''
def all_chemicals_releases(request):
    ne_lat = float(request.GET.get('ne_lat', default=0.0))
    ne_lng = float(request.GET.get('ne_lng', default=0.0))
    sw_lat = float(request.GET.get('sw_lat', default=0.0))
    sw_lng = float(request.GET.get('sw_lng', default=0.0))
    y = int(request.GET.get('year', default=latest_year))
    window = Q(facility__latitude__lt=ne_lat) & Q(facility__latitude__gt=sw_lat) & Q(
        facility__longitude__lt=ne_lng) & Q(facility__longitude__gt=sw_lng)
    qs = release.objects.filter(window & Q(year=y)).values('chemical__name').annotate(
        Sum('air'), Sum('water'), Sum('land'), Sum('off_site'))
    # print(qs.query)
    return JsonResponse(list(qs), content_type='application/json', safe=False)


''' Returns all chemicals and respective total release (not by type / only total) amounts in queried location {Graph 15} '''

def all_chemicals_total_releases(request):
    ne_lat = float(request.GET.get('ne_lat', default=0.0))
    ne_lng = float(request.GET.get('ne_lng', default=0.0))
    sw_lat = float(request.GET.get('sw_lat', default=0.0))
    sw_lng = float(request.GET.get('sw_lng', default=0.0))
    y = int(request.GET.get('year', default=latest_year))
    window = Q(facility__latitude__lt=ne_lat) & Q(facility__latitude__gt=sw_lat) & Q(
        facility__longitude__lt=ne_lng) & Q(facility__longitude__gt=sw_lng)
    qs = release.objects.filter(window & Q(year=y)).values('chemical__name').annotate(Sum('total')).order_by('-total')
    # print(qs.query)
    return JsonResponse(list(qs), content_type='application/json', safe=False)


''' Returns all facilities and respective total release (not by type / only total) amounts in queried location {Graph 12} '''
def all_facility_releases(request):
    ne_lat = float(request.GET.get('ne_lat', default=0.0))
    ne_lng = float(request.GET.get('ne_lng', default=0.0))
    sw_lat = float(request.GET.get('sw_lat', default=0.0))
    sw_lng = float(request.GET.get('sw_lng', default=0.0))
    y = int(request.GET.get('year', default=latest_year))
    window = Q(facility__latitude__lt=ne_lat) & Q(facility__latitude__gt=sw_lat) & Q(
        facility__longitude__lt=ne_lng) & Q(facility__longitude__gt=sw_lng)
    qs = release.objects.filter(window & Q(year=y)).values(
        'facility__name').annotate(
        Sum('air'), Sum('water'), Sum('land'), Sum('off_site'))
    # print(qs.query)
    return JsonResponse(list(qs), content_type='application/json', safe=False)


''' Returns all facilities and respective total release (not by type / only total) amounts in queried location {Graph 14} '''
def all_facility_total_releases(request):
    ne_lat = float(request.GET.get('ne_lat', default=0.0))
    ne_lng = float(request.GET.get('ne_lng', default=0.0))
    sw_lat = float(request.GET.get('sw_lat', default=0.0))
    sw_lng = float(request.GET.get('sw_lng', default=0.0))
    y = int(request.GET.get('year', default=latest_year))
    window = Q(facility__latitude__lt=ne_lat) & Q(facility__latitude__gt=sw_lat) & Q(
        facility__longitude__lt=ne_lng) & Q(facility__longitude__gt=sw_lng)
    qs = release.objects.filter(window & Q(year=y)).values('facility__name').annotate(Sum('total')).order_by('-total')
    # print(qs.query)
    return JsonResponse(list(qs), content_type='application/json', safe=False)


'''
Return top 10 companies in total releases by geo window & year
'''


def top_parentco_releases(request):
    ne_lat = float(request.GET.get('ne_lat', default=0.0))
    ne_lng = float(request.GET.get('ne_lng', default=0.0))
    sw_lat = float(request.GET.get('sw_lat', default=0.0))
    sw_lng = float(request.GET.get('sw_lng', default=0.0))
    y = int(request.GET.get('year', default=latest_year))
    window = Q(facility__latitude__lt=ne_lat) & Q(facility__latitude__gt=sw_lat) & Q(
        facility__longitude__lt=ne_lng) & Q(facility__longitude__gt=sw_lng)

    queryset = release.objects.filter(window & filterReleases(request) & Q(year=y)).values('facility__parent_co_name').annotate(total=Sum('total')).annotate(land=Sum('land')).annotate(
        air=Sum('air')).annotate(water=Sum('water')).annotate(off_site=Sum('off_site')).order_by('-total')[:10]
    return JsonResponse(list(queryset), content_type='application/json', safe=False)


'''
Return top ten polluting facilities over time by: window
'''


def timeline_top_parentco_releases(request):
    ne_lat = float(request.GET.get('ne_lat', default=0.0))
    ne_lng = float(request.GET.get('ne_lng', default=0.0))
    sw_lat = float(request.GET.get('sw_lat', default=0.0))
    sw_lng = float(request.GET.get('sw_lng', default=0.0))
    filters = Q(facility__latitude__lt=ne_lat) & Q(facility__latitude__gt=sw_lat) & Q(
        facility__longitude__lt=ne_lng) & Q(facility__longitude__gt=sw_lng)

    parents = list(release.objects.filter(filters & filterReleases(request) & Q(year=latest_year)).values_list(
        'facility__parent_co_name', flat=True).annotate(total=Sum('total')).order_by('-total'))[:10]
    response = release.objects.filter(filters & filterReleases(request) & Q(facility__parent_co_name__in=parents)).values(
        'year', 'facility__parent_co_name').order_by('facility__parent_co_name', 'year').annotate(total=Sum('total'))
    return HttpResponse(json.dumps(list(response), cls=DjangoJSONEncoder), content_type='application/json')


""" Returns the total releases (in lbs) in a location for each available year. """


def timeline_total(request):
    ne_lat = float(request.GET.get('ne_lat', default=0.0))
    ne_lng = float(request.GET.get('ne_lng', default=0.0))
    sw_lat = float(request.GET.get('sw_lat', default=0.0))
    sw_lng = float(request.GET.get('sw_lng', default=0.0))
    window = (Q(facility__latitude__lt=ne_lat) & Q(facility__latitude__gt=sw_lat)
              & Q(facility__longitude__lt=ne_lng)
              & Q(facility__longitude__gt=sw_lng))

    queryset = release.objects.filter(window & filterReleases(request)).values(
        'year').annotate(total=Sum('total')).order_by('year')
    response = json.dumps(list(queryset), cls=DjangoJSONEncoder)
    return HttpResponse(response, content_type='application/json')


'''
Return top ten polluting facilities by: window
'''


def top_facility_releases(request):
    ne_lat = float(request.GET.get('ne_lat', default=0.0))
    ne_lng = float(request.GET.get('ne_lng', default=0.0))
    sw_lat = float(request.GET.get('sw_lat', default=0.0))
    sw_lng = float(request.GET.get('sw_lng', default=0.0))
    all = int(request.GET.get('all', default=0))
    y = int(request.GET.get('year', default=latest_year))
    window = Q(facility__latitude__lt=ne_lat) & Q(facility__latitude__gt=sw_lat) & Q(
        facility__longitude__lt=ne_lng) & Q(facility__longitude__gt=sw_lng)
    if all == 1:
        queryset = release.objects.filter(window & filterReleases(request) & Q(year=y)).values('facility__name').annotate(total=Sum('on_site')).annotate(land=Sum('land')).annotate(
            air=Sum('air')).annotate(water=Sum('water')).annotate(vet_total_releases_offsite=Sum('off_site')).order_by('-total')
    else:
        queryset = release.objects.filter(window & filterReleases(request) & Q(year=y)).values('facility__name').annotate(
            total=Sum('total')).annotate(land=Sum('land')).annotate(air=Sum('air')).annotate(water=Sum('water')).annotate(off_site=Sum('off_site')).order_by('-total')[:10]
    return JsonResponse(list(queryset), content_type='application/json', safe=False)


'''
Return top ten polluting facilities over time by: window
'''


def timeline_top_facility_releases(request):
    ne_lat = float(request.GET.get('ne_lat', default=0.0))
    ne_lng = float(request.GET.get('ne_lng', default=0.0))
    sw_lat = float(request.GET.get('sw_lat', default=0.0))
    sw_lng = float(request.GET.get('sw_lng', default=0.0))
    get_averages = bool(request.GET.get('averages'))
    window = Q(facility__latitude__lt=ne_lat) & Q(facility__latitude__gt=sw_lat) & Q(
        facility__longitude__lt=ne_lng) & Q(facility__longitude__gt=sw_lng)
    release_list = release.objects.filter(window & filterReleases(request) & Q(
        year=2018)).values('facility__id').annotate(total=Sum('total')).order_by('-total')
    top_facilities = [x['facility__id'] for x in release_list][:10]
    lines = release.objects.filter(window & filterReleases(request) & Q(facility__id__in=top_facilities)).values(
        'year', 'facility__name').order_by('facility__name', 'year').annotate(total=Sum('total'))

    if(get_averages):
        averages = facility.objects.filter(Q(id__in=top_facilities)).values(
            'name').annotate(avg=Avg('release__total')).order_by('-avg')
    return HttpResponse(json.dumps({'averages': list(averages) if get_averages else None, 'lines': list(lines)}, cls=DjangoJSONEncoder), content_type='application/json')

# stats/location/num_facilities


def num_facilities(request):
    state = str(request.GET.get('state')).upper()
    ne_lat = float(request.GET.get('ne_lat', default=0.0))
    ne_lng = float(request.GET.get('ne_lng', default=0.0))
    sw_lat = float(request.GET.get('sw_lat', default=0.0))
    sw_lng = float(request.GET.get('sw_lng', default=0.0))
    # y = int(request.GET.get('year', default=latest_year))
    if state != 'None' and ne_lat == 0.0 and sw_lng == 0.0 and ne_lng == 0.0 and sw_lat == 0.0:
        data = facility.objects.filter(
            st=state).values('name').distinct().count()
    else:
        data = facility.objects.filter(Q(latitude__lt=ne_lat) & Q(latitude__gt=sw_lat)
                                       & Q(longitude__lt=ne_lng) & Q(longitude__gt=sw_lng)).values('name') \
            .distinct().count()
    return HttpResponse(data, content_type='application/json')


'''
Return summary points within window
'''


def country_summary(request):
    y = int(request.GET.get('year', default=latest_year))
    raw = release.objects.filter(Q(year=y)).aggregate(total=Sum(
        'total'), num_facilities=Count('facility__id', distinct=True), num_chemicals=Count('chemical__id', distinct=True),
        total_air=Sum('air'), total_water=Sum('water'), total_land=Sum('land'), total_on_site=Sum('on_site'), total_off_site=Sum('off_site'))
    raw['total_carcinogen'] = release.objects.filter(Q(year=y) & Q(
        chemical__carcinogen='YES')).aggregate(carcinogen=Sum('total'))['carcinogen']
    response = json.dumps(raw, cls=DjangoJSONEncoder)
    return HttpResponse(response, content_type='application/json')


def location_summary(request):
    ne_lat = float(request.GET.get('ne_lat', default=0.0))
    ne_lng = float(request.GET.get('ne_lng', default=0.0))
    sw_lat = float(request.GET.get('sw_lat', default=0.0))
    sw_lng = float(request.GET.get('sw_lng', default=0.0))
    y = int(request.GET.get('year', default=latest_year))
    window = Q(facility__latitude__lt=ne_lat) & Q(facility__latitude__gt=sw_lat) & Q(
        facility__longitude__lt=ne_lng) & Q(facility__longitude__gt=sw_lng)
    raw = release.objects.filter(window & Q(year=y)).aggregate(total=Sum(
        'total'), num_facilities=Count('facility__id', distinct=True), num_chemicals=Count('chemical__id', distinct=True),
        total_air=Sum('air'), total_water=Sum('water'), total_land=Sum('land'), total_on_site=Sum('on_site'), total_off_site=Sum('off_site'))
    raw['total_carcinogen'] = release.objects.filter(window & Q(year=y) & Q(
        chemical__carcinogen='YES')).aggregate(carcinogen=Sum('total'))['carcinogen']
    response = json.dumps(raw, cls=DjangoJSONEncoder)
    return HttpResponse(response, content_type='application/json')


def top_chemicals(request):
    ne_lat = float(request.GET.get('ne_lat', default=0.0))
    ne_lng = float(request.GET.get('ne_lng', default=0.0))
    sw_lat = float(request.GET.get('sw_lat', default=0.0))
    sw_lng = float(request.GET.get('sw_lng', default=0.0))
    y = int(request.GET.get('year', default=latest_year))
    window = Q(facility__latitude__lt=ne_lat) & Q(facility__latitude__gt=sw_lat) & Q(
        facility__longitude__lt=ne_lng) & Q(facility__longitude__gt=sw_lng)
    raw = release.objects.filter(window & filterReleases(request) & Q(year=y)).values(
        'chemical__name').annotate(total=Sum('total')).order_by('-total')[:10]
    return JsonResponse(list(raw), content_type='application/json', safe=False)


""" Returns the total release amount over time for the top 10 chemicals released in latest_year. """


def top_pbt_chemicals(request):
    ne_lat = float(request.GET.get('ne_lat', default=0.0))
    ne_lng = float(request.GET.get('ne_lng', default=0.0))
    sw_lat = float(request.GET.get('sw_lat', default=0.0))
    sw_lng = float(request.GET.get('sw_lng', default=0.0))
    y = int(request.GET.get('year', default=latest_year))
    window = Q(facility__latitude__lt=ne_lat) & Q(facility__latitude__gt=sw_lat) & Q(
        facility__longitude__lt=ne_lng) & Q(facility__longitude__gt=sw_lng)
    raw = release.objects.filter(window & filterReleases(request) & Q(year=y) & Q(chemical__classification='PBT')).values(
        'chemical__name').annotate(total=Sum('total')).order_by('-total')[:10]
    return JsonResponse(list(raw), content_type='application/json', safe=False)


def timeline_top_chemicals(request):
    ne_lat = float(request.GET.get('ne_lat', default=0.0))
    ne_lng = float(request.GET.get('ne_lng', default=0.0))
    sw_lat = float(request.GET.get('sw_lat', default=0.0))
    sw_lng = float(request.GET.get('sw_lng', default=0.0))
    window = Q(facility__latitude__lt=ne_lat) & Q(facility__latitude__gt=sw_lat) & Q(
        facility__longitude__lt=ne_lng) & Q(facility__longitude__gt=sw_lng)
    chemicals = list(release.objects.filter(window & filterReleases(request) & Q(year=latest_year)).values_list(
        'chemical__id', flat=True).annotate(total=Sum('total')).order_by('-total'))[:10]
    response = release.objects.filter(window & filterReleases(request) & Q(chemical__id__in=chemicals)).values(
        'year', 'chemical__name').order_by('chemical__name', 'year').annotate(total=Sum('total'))
    return HttpResponse(json.dumps(list(response), cls=DjangoJSONEncoder), content_type='application/json')


def timeline_top_pbt_chemicals(request):
    ne_lat = float(request.GET.get('ne_lat', default=0.0))
    ne_lng = float(request.GET.get('ne_lng', default=0.0))
    sw_lat = float(request.GET.get('sw_lat', default=0.0))
    sw_lng = float(request.GET.get('sw_lng', default=0.0))
    window = Q(facility__latitude__lt=ne_lat) & Q(facility__latitude__gt=sw_lat) & Q(
        facility__longitude__lt=ne_lng) & Q(facility__longitude__gt=sw_lng)
    chemicals = list(release.objects.filter(window & filterReleases(request) & Q(year=latest_year) & Q(chemical__classification='PBT')).values_list(
        'chemical__id', flat=True).annotate(total=Sum('total')).order_by('-total'))[:10]
    response = release.objects.filter(window & filterReleases(request) & Q(chemical__id__in=chemicals)).values(
        'year', 'chemical__name').order_by('chemical__name', 'year').annotate(total=Sum('total'))
    return HttpResponse(json.dumps(list(response), cls=DjangoJSONEncoder), content_type='application/json')


def clean_chemical_name(str):
    pattern = re.compile(r'\([^)]*\)|compounds|\"| and.*', re.IGNORECASE)
    return pattern.sub("", str).strip()


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


def idview(request):
    p_id = int(request.GET.get('id'))
    result = tri.objects.get(id=p_id)
    serializer = t_szr(result)
    return JsonResponse(serializer.data)


def chemview(request):
    p_chem = str(request.GET.get('chemical')).upper()
    resultset = tri.objects.filter(chemical=p_chem)[:10]
    return HttpResponse(szs.serialize('json', resultset), content_type='application/json')


def cityview(request):
    p_city = str(request.GET.get('city')).upper()
    resultset = tri.objects.filter(city=p_city)[:10]
    data = szs.serialize('json', resultset)
    return HttpResponse(data, content_type='application/json')


def zipview(request):
    p_zip = int(request.GET.get('zip'))
    resultset = tri.objects.filter(zip=p_zip)
    data = szs.serialize('json', resultset)
    return HttpResponse(data, content_type='application/json')


def demo(request, tri_attr=int(-9999)):
    if tri_attr == -9999:
        return HttpResponse('<h1>No attribute requested</h1>')
    else:
        return HttpResponse('<h1>TRI data for attribute # {}</h1>'.format(tri_attr))

# - https://docs.djangoproject.com/en/3.1/ref/models/querysets/#field-lookups
