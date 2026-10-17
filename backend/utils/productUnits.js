const unitDefinitions = {
  kg: { family: "mass", factor: 1000 },
  g: { family: "mass", factor: 1 },
  l: { family: "volume", factor: 1000 },
  ml: { family: "volume", factor: 1 },
  piece: { family: "count", factor: 1 },
};

const convertQuantity = (quantity, fromUnit, toUnit) => {
  const amount = Number(quantity);
  const from = unitDefinitions[fromUnit];
  const to = unitDefinitions[toUnit];
  if (!Number.isFinite(amount) || !from || !to || from.family !== to.family) return null;
  return (amount * from.factor) / to.factor;
};

module.exports = { convertQuantity };
