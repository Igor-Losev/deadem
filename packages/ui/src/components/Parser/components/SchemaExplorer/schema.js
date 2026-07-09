const TABLE_MODELS = new Set([ 'TABLE_FIXED', 'TABLE_VARIABLE' ]);

const MAX_DEPTH = 24;

function buildNode(field, parentKey, parentPath, depth) {
  const model = field.model.code;
  const key = parentKey ? `${parentKey}.${field.name}` : field.name;
  const path = parentPath ? `${parentPath}.${field.name}` : field.name;

  const node = {
    key,
    model,
    name: field.name,
    path,
    type: field.definition.toString(),
    children: null
  };

  if (TABLE_MODELS.has(model) && depth < MAX_DEPTH) {
    const childPath = model === 'TABLE_VARIABLE' ? `${path}.0000` : path;

    node.children = field.serializer.fields.map((child) => buildNode(child, key, childPath, depth + 1));
  }

  return node;
}

export function buildClassTree(cls) {
  return (cls.serializer?.fields ?? []).map((field) => buildNode(field, '', '', 0));
}

export function countNodes(nodes) {
  let total = 0;

  for (const node of nodes) {
    total += 1;

    if (node.children !== null) {
      total += countNodes(node.children);
    }
  }

  return total;
}

function getGroupKey(name) {
  const parts = name.split('_');

  if (parts.length >= 3) {
    return `${parts[0]}_${parts[1]}`;
  }

  if (parts.length === 2) {
    return parts[0];
  }

  const camel = name.match(/^C[A-Z][a-z0-9]*/);

  return camel ? camel[0] : name;
}

export function groupClasses(classes) {
  const byKey = new Map();

  for (const cls of classes) {
    const key = getGroupKey(cls.name);
    const existing = byKey.get(key);

    if (existing) {
      existing.push(cls);
    } else {
      byKey.set(key, [ cls ]);
    }
  }

  const groups = [];
  const other = [];

  for (const [ key, members ] of byKey) {
    if (members.length < 2) {
      other.push(...members);
    } else {
      groups.push({ key, classes: members });
    }
  }

  for (const group of groups) {
    group.classes.sort((left, right) => left.name.localeCompare(right.name));
  }

  groups.sort((left, right) => left.key.localeCompare(right.key));

  if (other.length > 0) {
    other.sort((left, right) => left.name.localeCompare(right.name));

    groups.push({ key: 'Other', classes: other });
  }

  return groups;
}

export function buildFieldIndex(classes) {
  const sorted = [ ...classes ].sort((left, right) => left.name.localeCompare(right.name));
  const index = [];

  for (const cls of sorted) {
    const visit = (nodes) => {
      for (const node of nodes) {
        index.push({
          classId: cls.id,
          className: cls.name,
          key: node.key,
          keyLower: node.key.toLowerCase(),
          nameLower: node.name.toLowerCase(),
          path: node.path,
          type: node.type
        });

        if (node.children !== null) {
          visit(node.children);
        }
      }
    };

    visit(buildClassTree(cls));
  }

  return index;
}

export function searchFields(index, query) {
  const lower = query.toLowerCase();

  if (!lower.includes('.')) {
    return index.filter((entry) => entry.nameLower.includes(lower));
  }

  return index.filter((entry) => entry.keyLower.includes(normalizeFieldKey(lower)));
}

export function normalizeFieldKey(key) {
  return key.split('.').filter((segment) => !/^\d+$/.test(segment)).join('.');
}

export function buildTypeMap(cls) {
  const map = new Map();
  const visit = (nodes) => {
    for (const node of nodes) {
      map.set(node.key, node.type);
      if (node.children !== null) {
        visit(node.children);
      }
    }
  };

  visit(buildClassTree(cls));

  return map;
}
