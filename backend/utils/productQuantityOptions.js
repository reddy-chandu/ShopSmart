const { convertQuantity } = require("./productUnits");

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
    if (
      options.quantity !== undefined ||
      options.amount !== undefined ||
      options.value !== undefined ||
      options.options !== undefined ||
      options.values !== undefined ||
      options.quantities !== undefined
    ) {
      return expandQuantityOptions([options], fallbackUnit);
    }
    return Object.entries(options).flatMap(([unit, values]) =>
      expandQuantityOptions(Array.isArray(values) ? values : [values], unit)
    );
  }

  return [];
};

const normalizeQuantityOptions = (options, defaultUnit = "kg") => {
  const uniqueOptions = new Map();

  expandQuantityOptions(options, defaultUnit).forEach((option) => {
    const quantity = Number(option.quantity);
    const unit = normalizeUnit(option.unit, defaultUnit);
    if (!Number.isFinite(quantity) || quantity <= 0 || convertQuantity(quantity, unit, defaultUnit) === null) return;

    const normalizedQuantity = Number(quantity.toFixed(10));
    uniqueOptions.set(`${unit}:${normalizedQuantity}`, {
      quantity: normalizedQuantity,
      unit,
    });
  });

  return [...uniqueOptions.values()].sort((left, right) =>
    left.unit.localeCompare(right.unit) || left.quantity - right.quantity
  );
};

module.exports = { normalizeQuantityOptions, expandQuantityOptions, normalizeUnit };