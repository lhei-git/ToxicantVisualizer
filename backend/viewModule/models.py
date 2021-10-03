from django.db import models


# Model class to reflect 'facilities' table
class Facility(models.Model):
    id = models.TextField(db_column='trf_id', primary_key=True)
    name = models.TextField(db_column='facility_name', blank=True, null=True)
    street_address = models.TextField(blank=True, null=True)
    city = models.TextField(blank=True, null=True)
    county = models.TextField(blank=True, null=True)
    state = models.TextField(blank=True, null=True)
    zip = models.IntegerField(blank=True, null=True)
    latitude = models.FloatField(blank=True, null=True)
    longitude = models.FloatField(blank=True, null=True)
    parent_co_name = models.TextField(
        db_column="resoved_parent_co", blank=True, null=True)
    industry_sector_code = models.TextField(blank=True, null=True)
    industry_sector = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.name

    class Meta:
        db_table = 'facilities'


# Model class to reflect 'chemicals' table
class Chemical(models.Model):
    id = models.TextField(db_column='compound_id', primary_key=True)
    name = models.TextField(db_column='chemical', blank=True, null=True)
    clean_air_act_chemical = models.CharField(
        max_length=100, blank=True, null=True)
    classification = models.CharField(max_length=100, blank=True, null=True)
    metal_category = models.IntegerField(blank=True, null=True)
    carcinogen = models.TextField(blank=True, null=True)
    unit_of_measure = models.TextField(blank=True, null=True)
    facilities = models.ManyToManyField(Facility, through='Release')

    def __str__(self):
        return self.name

    class Meta:
        db_table = 'chemicals'


# Model class to reflect 'releases' table
class Release(models.Model):
    year = models.IntegerField(blank=True, null=True)
    doc_ctrl_num = models.TextField(primary_key=True)
    facility = models.ForeignKey(
        Facility, db_column="trf_id", on_delete=models.CASCADE)
    chemical = models.ForeignKey(
        Chemical, db_column="compound_id", on_delete=models.CASCADE)
    air = models.FloatField(
        db_column="vet_total_air_releases", blank=True, null=True)
    water = models.FloatField(db_column="water", blank=True, null=True)
    land = models.FloatField(
        db_column="vet_total_land_releases", blank=True, null=True)
    on_site = models.FloatField(
        db_column="onsite_release_total", blank=True, null=True)
    off_site = models.FloatField(
        db_column="offsite_release_total", blank=True, null=True)
    total = models.FloatField(
        db_column="total_releases", blank=True, null=True)

    def __str__(self):
        return 'Release at: {}'.format(self.facility)

    class Meta:
        db_table = 'releases'
        ordering = ['total']
