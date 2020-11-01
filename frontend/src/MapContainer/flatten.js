module.exports = (data) => {
  let entries = data;
  const unique = [];

  entries = entries.sort((a, b) => a.facility.localeCompare(b.facility));

  entries.forEach((e) => {
    /* found new unique facility */
    if (!unique.some((u) => u.facility.localeCompare(e.facility) === 0)) {
      const newEntry = e;
      newEntry.chemicals = [];

      if (e.vet_total_releases === 0) return;

      /* convert chemical info to an object, add to chemicals array */
      newEntry.chemicals.push({
        name: e.chemical,
        clean_air_act_chemical: e.clean_air_act_chemical,
        classification: e.classification,
        carcinogen: e.carcinogen,
        unit_of_measure: e.unit_of_measure,
        fugitive_air: e.fugitive_air,
        stack_air: e.stack_air,
        vet_total_releases_air: e.vet_total_releases_air,
        total_releases_water: e.total_releases_water,
        vet_total_releases_land: e.vet_total_releases_land,
        vet_total_releases_onsite: e.vet_total_releases_onsite,
        vet_total_releases_offsite: e.vet_total_releases_offsite,
        vet_total_releases: e.vet_total_releases,
        onetime_release: e.onetime_release,
      });

      /* remove attributes from facility */
      delete newEntry.chemical;
      delete newEntry.clean_air_act_chemical;
      delete newEntry.classification;
      delete newEntry.unit_of_measure;
      delete newEntry.carcinogen;
      delete newEntry.stack_air;
      delete newEntry.fugitive_air;
      delete newEntry.vet_total_releases_air;
      delete newEntry.total_releases_water;
      delete newEntry.vet_total_releases_land;
      delete newEntry.vet_total_releases_onsite;
      delete newEntry.vet_total_releases_offsite;
      delete newEntry.vet_total_releases;
      delete newEntry.onetime_release;

      unique.push(newEntry);
    } else {
      if (e.vet_total_releases === 0) return;

      const existing = unique.find(
        (u) => u.facility.localeCompare(e.facility) === 0
      );
      existing.chemicals.push({
        name: e.chemical,
        clean_air_act_chemical: e.clean_air_act_chemical,
        classification: e.classification,
        carcinogen: e.carcinogen,
        unit_of_measure: e.unit_of_measure,
        fugitive_air: e.fugitive_air,
        stack_air: e.stack_air,
        vet_total_releases_air: e.vet_total_releases_air,
        total_releases_water: e.total_releases_water,
        vet_total_releases_land: e.vet_total_releases_land,
        vet_total_releases_onsite: e.vet_total_releases_onsite,
        vet_total_releases_offsite: e.vet_total_releases_offsite,
        vet_total_releases: e.vet_total_releases,
        onetime_release: e.onetime_release,
      });
    }
  });
  return unique;
};
