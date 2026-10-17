// Get a single product unit
export const getProductUnit = (product) => product?.unit || "kg";

const unitDefinitions = {
  kg: { family: "mass", factor: 1000 },
  g: { family: "mass", factor: 1 },
  l: { family: "volume", factor: 1000 },
  ml: { family: "volume", factor: 1 },
  piece: { family: "count", factor: 1 },
};

export const convertQuantity = (quantity, fromUnit, toUnit) => {
  const amount = Number(quantity);
  const from = unitDefinitions[fromUnit];
  const to = unitDefinitions[toUnit];
  if (!Number.isFinite(amount) || !from || !to || from.family !== to.family) return null;
  return (amount * from.factor) / to.factor;
};

export const getRateForUnit = (rate, productUnit, quantityUnit) => {
  const conversion = convertQuantity(1, quantityUnit, productUnit);
  return conversion === null ? Number(rate) : Number(rate) * conversion;
};

const normalizeUnit = (unit, fallbackUnit) => {
  const normalized = String(unit || fallbackUnit || "kg").trim().toLowerCase();
  const aliases = {
    kilogram: "kg",
    kilograms: "kg",
    gram: "g",
    grams: "g",
    liter: "l",
    liters: "l",
    litre: "l",
    litres: "l",
    milliliter: "ml",
    milliliters: "ml",
    millilitre: "ml",
    millilitres: "ml",
    pieces: "piece",
  };
  return aliases[normalized] || normalized;
};

const expandQuantityOptions = (options, fallbackUnit) => {
  if (typeof options === "string") {
    try {
      options = JSON.parse(options);
    } catch {
      return options.split(",").map((quantity) => ({
        quantity: quantity.trim(),
        unit: normalizeUnit(null, fallbackUnit),
      }));
    }
  }

  if (Array.isArray(options)) {
    return options.flatMap((option) => {
      if (option && typeof option === "object") {
        const unit = normalizeUnit(option.unit || option.quantityUnit || option.measureUnit, fallbackUnit);
        const values = option.quantities || option.values || option.options;
        if (Array.isArray(values)) {
          return values.map((quantity) => ({ quantity, unit }));
        }
        if (option.quantity !== undefined || option.amount !== undefined || option.value !== undefined) {
          return [{
            quantity: option.quantity ?? option.amount ?? option.value,
            unit,
          }];
        }
        return Object.entries(option).flatMap(([optionUnit, quantities]) =>
          expandQuantityOptions(Array.isArray(quantities) ? quantities : [quantities], optionUnit)
        );
      }
      return [{ quantity: option, unit: normalizeUnit(null, fallbackUnit) }];
    });
  }

  if (options && typeof options === "object") {
    if (options.quantity !== undefined || options.amount !== undefined || options.value !== undefined) {
      return expandQuantityOptions([options], fallbackUnit);
    }
    if (options.options !== undefined || options.values !== undefined || options.quantities !== undefined) {
      return expandQuantityOptions([options], fallbackUnit);
    }
    return Object.entries(options).flatMap(([unit, values]) =>
      expandQuantityOptions(Array.isArray(values) ? values : [values], unit)
    );
  }

  return [];
};

// Normalize the quantity values
export const normalizeQuantityValues = (values) => [...new Set(
  String(values ?? "")
    .split(",")
    .map((value) => Number(value.trim()))
    .filter((quantity) => Number.isFinite(quantity) && quantity > 0)
    .map((quantity) => Number(quantity.toFixed(10)))
)].sort((left, right) => left - right);

// Get a single product quantity options
export const getProductQuantityOptions = (product) => {
  const productUnit = normalizeUnit(getProductUnit(product));
  return expandQuantityOptions(product?.quantityOptions, productUnit)
    .map((option) => ({
      quantity: Number(option.quantity),
      unit: normalizeUnit(option.unit, productUnit),
    }))
    .filter((option) =>
      Number.isFinite(option.quantity) &&
      option.quantity > 0 &&
      convertQuantity(option.quantity, option.unit, productUnit) !== null
    )
    .sort((left, right) =>
      convertQuantity(left.quantity, left.unit, productUnit) -
      convertQuantity(right.quantity, right.unit, productUnit)
    );
};

// Format the quantity of a product ( (quantity) + (unit) - for example "1 kg" )
export const formatQuantity = (quantity, unit) => {
  const value = Number(quantity);
  const formatted = Number.isFinite(value) ? String(Number(value.toFixed(3))) : String(quantity ?? "");
  const normalizedUnit = unit || "kg";
  if (normalizedUnit === "piece") return `${formatted} ${value === 1 ? "piece" : "pieces"}`;
  return `${formatted} ${normalizedUnit}`;
};

// Format the rate of a product ( ₹ + (rate) + (unit) - for example "₹ 100/kg" )
export const formatRate = (rate, unit) => `₹ ${rate}/${unit || "kg"}`;