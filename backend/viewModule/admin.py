# Register your models here.
from django.contrib import admin
from .models import Facility, Chemical, Release
admin.site.register(Facility)
admin.site.register(Chemical)
admin.site.register(Release)

