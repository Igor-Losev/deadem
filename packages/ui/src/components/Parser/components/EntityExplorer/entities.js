import { jsonReplacer } from './../../utils';
import { buildTypeMap, normalizeFieldKey } from './../SchemaExplorer/schema';

export function getEntityId(entity) {
  return `${entity.index}-${entity.class.id}-${entity.serial}`;
}

export function matchesNumericFilter(entity, digits) {
  return String(entity.index).startsWith(digits) || String(entity.handle).startsWith(digits);
}

const NULL_HANDLE = 0xFFFFFF;

export function isHandleField(field) {
  if (typeof field.value !== 'number' || field.value === NULL_HANDLE || field.type === null) {
    return false;
  }

  if (field.type.startsWith('CHandle<')) {
    return true;
  }

  return field.type.includes('<CHandle<') && /\.\d+$/.test(field.key);
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
  return JSON.stringify(entity.unpackFlattened(), jsonReplacer, 2);
}

export function buildTypedFields(entity) {
  const typeMap = buildTypeMap(entity.class);
  const fields = entity.unpackFlattened();
  const entries = [];

  for (const key of Object.keys(fields)) {
    const normalized = normalizeFieldKey(key);

    entries.push({
      key,
      type: typeMap.get(normalized) ?? null,
      value: fields[key]
    });
  }

  return entries;
}
