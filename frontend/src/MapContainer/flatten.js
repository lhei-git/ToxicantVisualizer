module.exports = (data) => {
  let entries = data;
  const unique = [];

  entries = entries.sort((a, b) =>
    a.facilityname.localeCompare(b.facilityname)
  );

  entries.forEach((e) => {
    /* found new unique facility */
    if (
      !unique.some((u) => u.facilityname.localeCompare(e.facilityname) === 0)
    ) {
      const newEntry = e;
      newEntry.chemicals = [];

      if (e.totalreleases === 0) return;

      /* convert chemical info to an object, add to chemicals array */
      newEntry.chemicals.push({
        name: e.chemical,
        cleanairactchemical: e.cleanairactchemical,
        classification: e.classification,
        carcinogen: e.carcinogen,
        unitofmeasure: e.unitofmeasure,
        fugitiveair: e.fugitiveair,
        stackair: e.stackair,
        totalreleaseair: e.totalreleaseair,
        totalreleasewater: e.totalreleasewater,
        totalreleaseland: e.totalreleaseland,
        on_sitereleasetotal: e.on_sitereleasetotal,
        off_sitereleasetotal: e.off_sitereleasetotal,
        totalreleases: e.totalreleases,
        one_timerelease: e.one_timerelease,
      });

      /* remove attributes from facility */
      delete newEntry.chemical;
      delete newEntry.cleanairactchemical;
      delete newEntry.classification;
      delete newEntry.unitofmeasure;
      delete newEntry.carcinogen;
      delete newEntry.stackair;
      delete newEntry.fugitiveair;
      delete newEntry.totalreleaseair;
      delete newEntry.totalreleasewater;
      delete newEntry.totalreleaseland;
      delete newEntry.on_sitereleasetotal;
      delete newEntry.off_sitereleasetotal;
      delete newEntry.totalreleases;
      delete newEntry.one_timerelease;

      unique.push(newEntry);
    } else {
      if (e.totalreleases === 0) return;

      const existing = unique.find(
        (u) => u.facilityname.localeCompare(e.facilityname) === 0
      );
      existing.chemicals.push({
        name: e.chemical,
        cleanairactchemical: e.cleanairactchemical,
        classification: e.classification,
        carcinogen: e.carcinogen,
        unitofmeasure: e.unitofmeasure,
        fugitiveair: e.fugitiveair,
        stackair: e.stackair,
        totalreleaseair: e.totalreleaseair,
        totalreleasewater: e.totalreleasewater,
        totalreleaseland: e.totalreleaseland,
        on_sitereleasetotal: e.on_sitereleasetotal,
        off_sitereleasetotal: e.off_sitereleasetotal,
        totalreleases: e.totalreleases,
        one_timerelease: e.one_timerelease,
      });
    }
  });
  return unique;
};
