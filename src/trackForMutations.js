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
    tracked.children = {};

    for (const key in obj) {
      const childPath = path.concat(key);
      if (ignore.length && ignore.indexOf(childPath.join('.')) !== -1) {
        continue;
      }

      tracked.children[key] = trackProperties(
        isImmutable,
        ignore,
        obj[key],
        childPath
      );
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
  const keysToDetect = {};
  Object.keys(trackedProperty.children).forEach(key => {
    keysToDetect[key] = true;
  });
  Object.keys(obj).forEach(key => {
    keysToDetect[key] = true;
  });

  const keys = Object.keys(keysToDetect);
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    const childPath = path.concat(key);
    if (ignore.length && ignore.indexOf(childPath.join('.')) !== -1) {
      continue;
    }

    const result = detectMutations(
      isImmutable,
      ignore,
      trackedProperty.children[key],
      obj[key],
      sameRef,
      childPath
    );

    if (result.wasMutated) {
      return result;
    }
  }
  return { wasMutated: false };
}
