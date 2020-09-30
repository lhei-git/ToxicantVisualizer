from django.db import models


class Tri2018(models.Model):

    year = models.IntegerField(db_column='YEAR', blank=True, null=True)  
    facilityname = models.TextField(db_column='FACILITYNAME', blank=True, null=True)
    streetaddress = models.TextField(db_column='STREETADDRESS', blank=True, null=True)
    city = models.TextField(db_column='CITY', blank=True, null=True)
    county = models.TextField(db_column='COUNTY', blank=True, null=True)
    st = models.TextField(db_column='ST', blank=True, null=True)
    zip = models.IntegerField(db_column='ZIP', blank=True, null=True)
    latitude = models.FloatField(db_column='LATITUDE', blank=True, null=True)
    longitude = models.FloatField(db_column='LONGITUDE', blank=True, null=True)
    parentco = models.TextField(db_column='PARENTCO', blank=True, null=True)
    industrysector = models.TextField(db_column='INDUSTRYSECTOR', blank=True, null=True)
    chemical = models.TextField(db_column='CHEMICAL', blank=True, null=True)
    cleanairact = models.TextField(db_column='CLEANAIRACT', blank=True, null=True)
    id = models.AutoField(primary_key=True, blank=True)

    def __str__(self):
        return('\nPoisoning: {} \nFacility: {} \nCompany {}'.format(self.chemical, self.facilityname, self.parentco))

    class Meta:
        db_table = 'TRI_2018'
        # managed = false # makes sure create and update signals don't affect db