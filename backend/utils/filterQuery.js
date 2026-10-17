const filterData = (queryStr, filterParameter) => {
  const { gte, lte, gt, lt, category, keyword } = filterParameter;
  const conditions = {};
  const rateConditions = {};

  const numericFilters = { gte: "$gte", lte: "$lte", gt: "$gt", lt: "$lt" };
  Object.entries(numericFilters).forEach(([parameter, operator]) => {
    if (filterParameter[parameter] === undefined || filterParameter[parameter] === "") return;
    const value = Number(filterParameter[parameter]);
    if (Number.isFinite(value)) rateConditions[operator] = value;
  });
  if (Object.keys(rateConditions).length) conditions.rate = rateConditions;

  if (category) {
    const categories = category.split(",").filter(Boolean);
    if (categories.length) conditions.category = { $in: categories };
  }

  if (keyword !== undefined) {
    const escapedKeyword = String(keyword).slice(0, 100).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    conditions.$or = [
      { name: { $regex: escapedKeyword, $options: "i" } },
      { aliases: { $regex: escapedKeyword, $options: "i" } },
    ];
  }

  return Object.keys(conditions).length ? queryStr.find(conditions) : queryStr;
};

module.exports = { filterData };