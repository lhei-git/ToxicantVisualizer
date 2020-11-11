// cleans up string format and removes unsearchable words
module.exports.formatChemical = (entry) => {
  let trimmed = entry.toLowerCase().replace(/ *\([^)]*\) */g, "");
  const i = trimmed.search(/\band|compounds\b/);
  if (i !== -1) trimmed = trimmed.slice(0, i);
  trimmed = trimmed
    .replace(/\b\w/g, (l) => l.toUpperCase())
    .replace(/"/gi, "")
    .trim();

  if (trimmed.toUpperCase() === "POLYCYCLIC AROMATIC")
    return "Polycyclic Aromatic Compounds";
  return trimmed;
};

module.exports.shallowEqual = (obj1, obj2) => {
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);

  if (keys1.length !== keys2.length) {
    return false;
  }

  for (let key of keys1) {
    if (obj1[key] !== obj2[key]) {
      return false;
    }
  }

  return true;
};

module.exports.intToString = (value) => {
  var suffixes = ["", "K", "M", "B", "T"];
  var suffixNum = Math.floor(("" + value).length / 3);
  var shortValue = parseFloat(
    (suffixNum !== 0 ? value / Math.pow(1000, suffixNum) : value).toPrecision(2)
  );
  if (shortValue % 1 !== 0) {
    shortValue = shortValue.toFixed(1);
  }
  return shortValue + suffixes[suffixNum];
};
