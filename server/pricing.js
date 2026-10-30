// Products are priced per kg and sold by weight in grams.
// Line amount for `grams` of a per-kg price, rounded to the paisa (matches the client).
const lineTotal = (pricePerKg, grams) => Math.round(Number(pricePerKg) * Number(grams) / 10) / 100;

module.exports = { lineTotal };
