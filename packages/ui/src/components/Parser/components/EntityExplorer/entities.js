export function getEntityId(entity) {
  return `${entity.index}-${entity.class.id}-${entity.serial}`;
}

export function groupEntities(entities) {
  const containers = { byClass: new Map(), byId: new Map() };

  for (const entity of entities) {
    const entityId = getEntityId(entity);
    const existing = containers.byClass.get(entity.class);

    if (existing) {
      existing.push(entity);
    } else {
      containers.byClass.set(entity.class, [ entity ]);
    }

    containers.byId.set(entityId, entity);
  }

  return containers;
}

export function stringifyEntity(entity) {
  return JSON.stringify(
    entity.unpackFlattened(),
    (key, value) => typeof value === 'bigint' ? `${value.toString()}n` : value,
    2
  );
}
