export default function trackForMutations(isImmutable, obj) {
  const trackedProperties = trackProperties(isImmutable, obj);
  return {
    detectMutations() {
      return detectMutations(isImmutable, trackedProperties, obj);
    }
  };
}

function trackProperties(isImmutable, obj) {
  const tracked = { value: obj };

  if (!isImmutable(obj)) {
    tracked.children = {};

    for (const key in obj) {
      tracked.children[key] = trackProperties(isImmutable, obj[key]);
    }
  }
  return tracked;
}

function detectMutations(isImmutable, trackedProperty, obj, sameParentRef = false, path = []) {
  const prevObj = trackedProperty ? trackedProperty.value : undefined;

  const sameRef = prevObj === obj;

  if (sameParentRef && !sameRef) {
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
    const result = detectMutations(
      isImmutable,
      trackedProperty.children[key],
      obj[key],
      sameRef,
      path.concat(key)
    );

    if (result.wasMutated) {
      return result;
    }
  }
  return { wasMutated: false };
}
