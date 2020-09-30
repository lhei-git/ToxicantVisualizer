from rest_framework import serializers
from .models import Tri2018 as tri


# this class converts the quried tri class object to a dict instance
class Tri2018Serializer(serializers.Serializer):
    year = serializers.IntegerField()
    facilityname = serializers.CharField()
    streetaddress = serializers.CharField()
    city = serializers.CharField()
    county = serializers.CharField()
    st = serializers.CharField()
    zip = serializers.IntegerField()
    latitude = serializers.FloatField()
    longitude = serializers.FloatField()
    parentco = serializers.CharField()
    industrysector = serializers.CharField()
    chemical = serializers.CharField()
    cleanairact = serializers.CharField()
    id = serializers.IntegerField()

# NOTE - serializers don't have access to all django model fields