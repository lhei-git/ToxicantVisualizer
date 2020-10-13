from django.db import models


class Tri(models.Model):
    year = models.IntegerField(db_column='YEAR', blank=True, null=True)
    facilityname = models.TextField(db_column='FACILITYNAME', blank=True, null=True)
    streetaddress = models.TextField(db_column='STREETADDRESS', blank=True, null=True)
    city = models.TextField(db_column='CITY', blank=True, null=True)
    county = models.TextField(db_column='COUNTY', blank=True, null=True)
    st = models.TextField(db_column='ST', blank=True, null=True)
    zip = models.IntegerField(db_column='ZIP', blank=True, null=True)
    latitude = models.FloatField(db_column='LATITUDE', blank=True, null=True)
    longitude = models.FloatField(db_column='LONGITUDE', blank=True, null=True)
    parentconame = models.TextField(db_column='PARENTCONAME', blank=True, null=True)
    industrysector = models.TextField(db_column='INDUSTRYSECTOR', blank=True, null=True)
    chemical = models.TextField(db_column='CHEMICAL', blank=True, null=True)
    cleanairactchemical = models.TextField(db_column='CLEANAIRACTCHEMICAL', blank=True, null=True)
    classification = models.TextField(db_column='CLASSIFICATION', blank=True, null=True)
    carcinogen = models.TextField(db_column='CARCINOGEN', blank=True, null=True)
    unitofmeasure = models.TextField(db_column='UNITOFMEASURE', blank=True, null=True)
    fugitiveair = models.IntegerField(db_column='FUGITIVEAIR', blank=True, null=True)
    stackair = models.IntegerField(db_column='STACKAIR', blank=True, null=True)
    totalreleaseair = models.IntegerField(db_column='TOTALRELEASEAIR', blank=True, null=True)
    totalreleasewater = models.IntegerField(db_column='TOTALRELEASEWATER', blank=True, null=True)
    totalreleaseland = models.IntegerField(db_column='TOTALRELEASELAND', blank=True, null=True)
    on_sitereleasetotal = models.IntegerField(db_column='ON-SITERELEASETOTAL', blank=True, null=True)
    off_sitereleasetotal = models.IntegerField(db_column='OFF-SITERELEASETOTAL', blank=True, null=True)
    totalreleases = models.IntegerField(db_column='TOTALRELEASES', blank=True, null=True)
    one_timerelease = models.TextField(db_column='ONE-TIMERELEASE', blank=True, null=True)
    id = models.AutoField(primary_key=True, db_column='ID')

    class Meta:
        # managed = False
        db_table = 'TRI'


