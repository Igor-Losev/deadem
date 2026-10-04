import { COLORS } from './theme';

const TOKEN_RE = /("(?:\\.|[^"\\])*")(:)?|(\b(?:true|false|null)\b)|(-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?n?\b)/g;

export function HighlightedJson({ json }) {
  const parts = [];
  let lastIndex = 0;
  let key = 0;

  json.replace(TOKEN_RE, (match, str, colon, bool, num, offset) => {
    if (offset > lastIndex) {
      parts.push(json.slice(lastIndex, offset));
    }

    if (str && colon) {
      parts.push(<span key={key++} style={{ color: COLORS.jsonKey }}>{str}</span>);
      parts.push(':');
    } else if (str) {
      parts.push(<span key={key++} style={{ color: COLORS.jsonString }}>{str}</span>);
    } else if (bool) {
      parts.push(<span key={key++} style={{ color: COLORS.jsonBoolean }}>{bool}</span>);
    } else if (num) {
      parts.push(<span key={key++} style={{ color: COLORS.jsonNumber }}>{num}</span>);
    } else {
      parts.push(match);
    }

    lastIndex = offset + match.length;
    return match;
  });

  if (lastIndex < json.length) {
    parts.push(json.slice(lastIndex));
  }

  return parts;
}

export function jsonReplacer(key, value) {
  if (typeof value === 'bigint') {
    return `${value.toString()}n`;
  }

  if (ArrayBuffer.isView(value)) {
    return Array.from(value);
  }

  return value;
}

export function toPlainObject(value) {
  if (Array.isArray(value)) {
    return value.map(toPlainObject);
  }

  if (value === null || typeof value !== 'object' || ArrayBuffer.isView(value)) {
    return value;
  }

  const prototype = Object.getPrototypeOf(value);
  const keys = prototype === Object.prototype || prototype === null ? Object.keys(value) : Object.keys(prototype);

  const plain = { };

  for (const key of keys) {
    if (value[key] !== undefined) {
      plain[key] = toPlainObject(value[key]);
    }
  }

  return plain;
}

export function compare(a, b) {
  if (typeof a === 'string') {
    return a.localeCompare(b);
  }

  return a - b;
}
