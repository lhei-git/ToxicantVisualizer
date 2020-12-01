from django.db import models


class Tri(models.Model):
    year = models.IntegerField(blank=True, null=True)
    trifd = models.TextField(blank=True, null=True)
    frs_id = models.TextField(blank=True, null=True)
    facility = models.TextField(blank=True, null=True)
    street_address = models.TextField(blank=True, null=True)
    city = models.TextField(blank=True, null=True)
    county = models.TextField(blank=True, null=True)
    st = models.TextField(blank=True, null=True)
    zip = models.IntegerField(blank=True, null=True)
    latitude = models.FloatField(blank=True, null=True)
    longitude = models.FloatField(blank=True, null=True)
    horizontal_datum = models.TextField(blank=True, null=True)
    parent_co_name = models.TextField(blank=True, null=True)
    standard_parent_co_name = models.TextField(blank=True, null=True)
    vet_parent_co = models.TextField(blank=True, null=True)
    industry_sector_code = models.CharField(
        max_length=100, blank=True, null=True)
    industry_sector = models.TextField(blank=True, null=True)
    doc_ctrl_num = models.FloatField(blank=True, null=True)
    chemical = models.TextField(blank=True, null=True)
    clean_air_act_chemical = models.CharField(
        max_length=100, blank=True, null=True)
    classification = models.CharField(max_length=100, blank=True, null=True)
    metal = models.TextField(blank=True, null=True)
    metal_category = models.IntegerField(blank=True, null=True)
    carcinogen = models.TextField(blank=True, null=True)
    unit_of_measure = models.TextField(blank=True, null=True)
    fugitive_air = models.FloatField(blank=True, null=True)
    stack_air = models.FloatField(blank=True, null=True)
    vet_total_releases_air = models.FloatField(blank=True, null=True)
    total_releases_water = models.FloatField(blank=True, null=True)
    underground = models.FloatField(blank=True, null=True)
    underground_cl_i = models.FloatField(blank=True, null=True)
    underground_c_iiv = models.FloatField(blank=True, null=True)
    landfills = models.FloatField(blank=True, null=True)
    rcra_c_landfill = models.FloatField(blank=True, null=True)
    other_landfills = models.FloatField(blank=True, null=True)
    land_treatment = models.FloatField(blank=True, null=True)
    surface_impndmnt = models.FloatField(blank=True, null=True)
    rcra_surface_im = models.FloatField(blank=True, null=True)
    other_surface_i = models.FloatField(blank=True, null=True)
    other_disposal = models.FloatField(blank=True, null=True)
    epa_onsite_release_total = models.FloatField(blank=True, null=True)
    epa_offsite_release_total = models.FloatField(blank=True, null=True)
    unclassified = models.FloatField(blank=True, null=True)
    epa_total_releases = models.FloatField(blank=True, null=True)
    onsite_contained = models.FloatField(blank=True, null=True)
    onsite_other = models.FloatField(blank=True, null=True)
    vet_total_releases_land = models.FloatField(blank=True, null=True)
    offsite_contained = models.FloatField(blank=True, null=True)
    offsite_other = models.FloatField(blank=True, null=True)
    vet_total_releases_offsite = models.FloatField(blank=True, null=True)
    onetime_release = models.FloatField(blank=True, null=True)
    vet_total_releases_onsite = models.FloatField(blank=True, null=True)
    vet_total_releases = models.FloatField(blank=True, null=True)
    # Field name made lowercase.
    t_id = models.IntegerField(db_column='t_ID', primary_key=True)

    class Meta:
        # managed = False
        db_table = 'tt_tri_dump'


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
