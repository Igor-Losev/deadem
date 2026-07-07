import { COLORS } from './../../theme';
import { jsonReplacer } from './../../utils';

const PREVIEW_MAX_LENGTH = 160;
export const HEX_PREVIEW_BYTES = 512;
const HEX_BYTES_PER_LINE = 16;

export const VALUE_COLOR_BY_KIND = {
  empty: 'rgba(255,255,255,0.3)',
  bytes: 'rgba(255,255,255,0.5)',
  string: COLORS.jsonString,
  number: COLORS.jsonNumber,
  boolean: COLORS.jsonBoolean
};

export function stringifyValue(value) {
  return JSON.stringify(value, jsonReplacer, 2);
}

export function getValuePreview(value) {
  if (value === null || value === undefined) {
    return { kind: 'empty', text: '—' };
  }

  if (value instanceof Uint8Array) {
    const count = value.length;

    return { kind: 'bytes', text: `${count.toLocaleString('en-US')} byte${count === 1 ? '' : 's'}` };
  }

  if (typeof value === 'string') {
    return { kind: 'string', text: value === '' ? '—' : value };
  }

  if (typeof value === 'number' || typeof value === 'bigint') {
    return { kind: 'number', text: String(value) };
  }

  if (typeof value === 'boolean') {
    return { kind: 'boolean', text: String(value) };
  }

  const json = stringifyValue(value).replace(/\s+/g, ' ');

  return {
    kind: 'object',
    text: json.length > PREVIEW_MAX_LENGTH ? `${json.slice(0, PREVIEW_MAX_LENGTH)}…` : json
  };
}

function toHex(bytes) {
  let hex = '';

  for (let i = 0; i < bytes.length; i++) {
    if (i > 0) {
      hex += i % HEX_BYTES_PER_LINE === 0 ? '\n' : ' ';
    }

    hex += bytes[i].toString(16).padStart(2, '0');
  }

  return hex;
}

export function formatBytesHex(bytes) {
  const limited = bytes.subarray(0, HEX_PREVIEW_BYTES);

  return { hex: toHex(limited), truncated: bytes.length > HEX_PREVIEW_BYTES };
}

export function formatBytesHexFull(bytes) {
  return toHex(bytes);
}
