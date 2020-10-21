// cleans up string format and removes unsearchable words
module.exports.getChemical = (entry) => {
  let trimmed = entry.toLowerCase().replace(/ *\([^)]*\) */g, "");
  const i = trimmed.search(/\band|compounds\b/);
  if (i !== -1) trimmed = trimmed.slice(0, i);
  trimmed = trimmed.replace(/\b\w/g, (l) => l.toUpperCase());
  return trimmed;
};
