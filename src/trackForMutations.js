export default function trackForMutations(isImmutable, ignore, obj) {
  const trackedProperties = trackProperties(isImmutable, ignore, obj);
  return {
    detectMutations() {
      return detectMutations(isImmutable, ignore, trackedProperties, obj);
    }
  };
}

function trackProperties(isImmutable, ignore = [], obj, path = []) {
  const tracked = { value: obj };

  if (!isImmutable(obj)) {
    const objMap = normalizeIterable(obj);
    tracked.children = new Map();

    for (const item of objMap) {
      const [ key, value ] = item;
      const childPath = path.concat(key);
      if (ignore.length && ignore.indexOf(childPath.join('.')) !== -1) {
        continue;
      }

      tracked.children.set(key, trackProperties(
        isImmutable,
        ignore,
        objMap.get(key),
        childPath
      ));
    }
  }
  return tracked;
}

function detectMutations(isImmutable, ignore = [], trackedProperty, obj, sameParentRef = false, path = []) {
  const prevObj = trackedProperty ? trackedProperty.value : undefined;

  const sameRef = prevObj === obj;

  if (sameParentRef && !sameRef && !Number.isNaN(obj)) {
    return { wasMutated: true, path };
  }

  if (isImmutable(prevObj) || isImmutable(obj)) {
    return { wasMutated: false };
  }

  // Gather all keys from prev (tracked) and after objs
  const keysToDetect = new Map();
  const objMap = normalizeIterable(obj);
  trackedProperty.children.forEach((value, key) => {
    keysToDetect.set(key, true);
  });
  objMap.forEach((value, key) => {
    keysToDetect.set(key, true);
  });

  for (const item of keysToDetect) {
    const [ key ] = item;
    const childPath = path.concat(key);
    if (ignore.length && ignore.indexOf(childPath.join('.')) !== -1) {
      continue;
    }

    const { children } = trackedProperty;
    const result = detectMutations(
      isImmutable,
      ignore,
      children.get(key),
      objMap.get(key),
      sameRef,
      childPath
    );

    if (result.wasMutated) {
      return result;
    }
  }
  return { wasMutated: false };
}

const normalizeIterable = (obj) => {
  if (!isIterable(obj)) {
    // if not iterable, assume plain object
    const keys = Object.keys(obj);
    return new Map(keys.map(k => [k, obj[k]]));
  }

  if (obj instanceof Map) {
    return obj;
  }

  const map = new Map();
  const iterator = [...obj[Symbol.iterator]()];
  for (let i = 0, il = iterator.length; i < il; i++) {
    map.set(`${i}`, iterator[i]);
  }
  return map;
}

function isIterable(obj) {
  // checks for null and undefined
  if (obj == null) {
    return false;
  }
  return typeof obj[Symbol.iterator] === 'function';
}
