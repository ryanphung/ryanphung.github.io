const Json = (function () {
  const normalizeArraysToObjectsRecur = (obj) => {
    if (Array.isArray(obj))
      return {
        ..._.map(obj, normalizeArraysToObjectsRecur),
        __isArray: true,
      };

    if (typeof obj === "object")
      return _.mapValues(obj, normalizeArraysToObjectsRecur);

    return obj;
  };

  const restoreArraysFromObjectsRecur = (obj) => {
    if (typeof obj !== "object") return obj;

    if (obj.__isArray)
      return _.map(
        _.values(_.omit(obj, "__isArray")),
        restoreArraysFromObjectsRecur
      );

    return _.mapValues(obj, restoreArraysFromObjectsRecur);
  };

  const pickRecur = (obj, parts) => {
    if (parts.length === 0) return obj;

    if (typeof obj !== "object") return;

    const part = parts[0];

    if (part === "*") {
      // if (Array.isArray(obj))
      //   return _.filter(
      //     _.map(obj, (o) => pickRecur(o, parts.slice(1))),
      //     (v) => v !== undefined
      //   );

      return {
        ..._.pickBy(
          _.mapValues(obj, (o) => pickRecur(o, parts.slice(1))),
          (v) => v !== undefined
        ),
        ...(obj.__isArray
          ? {
              __isArray: true,
            }
          : null),
      };
    }

    const value = pickRecur(obj[part], parts.slice(1));

    if (value === undefined) return;

    return {
      [part]: value,
      ...(obj.__isArray
        ? {
            __isArray: true,
          }
        : null),
    };
  };

  const pickWildcard = (obj, paths) => {
    const o = normalizeArraysToObjectsRecur(obj);
    let result = {};

    paths.forEach((p) => {
      const parts = p.split(".");
      const curr = pickRecur(o, parts);
      result = _.merge(result, curr);
    });

    return restoreArraysFromObjectsRecur(result);
  };

  return {
    pickWildcard,
  };
})();
