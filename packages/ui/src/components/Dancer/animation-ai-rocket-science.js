import { useEffect, useState } from 'react';

import dancerAnimation from './dancer.json';

export const DANCER_VIEW_BOX = `0 0 ${dancerAnimation.w} ${dancerAnimation.h}`;

function readValue(property, fallback) {
  return property?.k ?? fallback;
}

function readPoint(property, fallback = [ 0, 0 ]) {
  const value = readValue(property, fallback);

  return [ value[0] ?? fallback[0], value[1] ?? fallback[1] ];
}

function readScalar(property, fallback = 0) {
  const value = readValue(property, fallback);

  return Array.isArray(value) ? value[0] ?? fallback : value;
}

function sampleCubic(p1, p2, t) {
  const inverse = 1 - t;

  return 3 * inverse * inverse * t * p1 + 3 * inverse * t * t * p2 + t * t * t;
}

function cubicBezierProgress(t, x1, y1, x2, y2) {
  let low = 0;
  let high = 1;
  let guess = t;

  for (let index = 0; index < 8; index += 1) {
    const x = sampleCubic(x1, x2, guess);

    if (Math.abs(x - t) < 0.001) {
      break;
    }

    if (x < t) {
      low = guess;
    } else {
      high = guess;
    }

    guess = (low + high) / 2;
  }

  return sampleCubic(y1, y2, guess);
}

function interpolateNumber(left, right, progress) {
  return left + (right - left) * progress;
}

function interpolatePoint(left, right, progress) {
  return [
    interpolateNumber(left[0], right[0], progress),
    interpolateNumber(left[1], right[1], progress)
  ];
}

function interpolatePointList(left, right, progress) {
  return left.map((point, index) => interpolatePoint(point, right[index] ?? point, progress));
}

function interpolateShape(left, right, progress) {
  return {
    c: left.c,
    i: interpolatePointList(left.i, right.i, progress),
    o: interpolatePointList(left.o, right.o, progress),
    v: interpolatePointList(left.v, right.v, progress)
  };
}

function getKeyframeShape(keys, frame) {
  if (!Array.isArray(keys) || keys.length === 0) {
    return null;
  }

  if (frame <= keys[0].t) {
    return keys[0].s[0];
  }

  for (let index = 0; index < keys.length - 1; index += 1) {
    const current = keys[index];
    const next = keys[index + 1];

    if (frame < next.t) {
      const start = current.s[0];
      const end = current.e?.[0] ?? next.s[0];

      if (current.h === 1) {
        return start;
      }

      const linearProgress = (frame - current.t) / (next.t - current.t);
      const progress = cubicBezierProgress(
        linearProgress,
        current.o?.x ?? 0.167,
        current.o?.y ?? 0.167,
        next.i?.x ?? 0.833,
        next.i?.y ?? 0.833
      );

      return interpolateShape(start, end, progress);
    }
  }

  return keys[keys.length - 1].s[0];
}

function getPathData(shape) {
  if (!shape?.v?.length) {
    return '';
  }

  const commands = [ `M ${shape.v[0][0]} ${shape.v[0][1]}` ];

  for (let index = 1; index < shape.v.length; index += 1) {
    const previousIndex = index - 1;
    const cp1 = [
      shape.v[previousIndex][0] + shape.o[previousIndex][0],
      shape.v[previousIndex][1] + shape.o[previousIndex][1]
    ];
    const cp2 = [
      shape.v[index][0] + shape.i[index][0],
      shape.v[index][1] + shape.i[index][1]
    ];

    commands.push(`C ${cp1[0]} ${cp1[1]} ${cp2[0]} ${cp2[1]} ${shape.v[index][0]} ${shape.v[index][1]}`);
  }

  if (shape.c) {
    const lastIndex = shape.v.length - 1;
    const cp1 = [
      shape.v[lastIndex][0] + shape.o[lastIndex][0],
      shape.v[lastIndex][1] + shape.o[lastIndex][1]
    ];
    const cp2 = [
      shape.v[0][0] + shape.i[0][0],
      shape.v[0][1] + shape.i[0][1]
    ];

    commands.push(`C ${cp1[0]} ${cp1[1]} ${cp2[0]} ${cp2[1]} ${shape.v[0][0]} ${shape.v[0][1]} Z`);
  }

  return commands.join(' ');
}

function getLineCap(value) {
  switch (value) {
    case 2: return 'round';
    case 3: return 'square';
    default: return 'butt';
  }
}

function getLineJoin(value) {
  switch (value) {
    case 2: return 'round';
    case 3: return 'bevel';
    default: return 'miter';
  }
}

function getLoopFrameCount(animation) {
  const animatedFrames = animation.layers.flatMap((layer) => (
    layer.shapes?.flatMap((shapeGroup) => (
      shapeGroup.it?.flatMap((item) => item.ty === 'sh' && Array.isArray(item.ks?.k) ? item.ks.k.map((key) => key.t) : []) ?? []
    )) ?? []
  ));

  return (animatedFrames.length > 0 ? Math.max(...animatedFrames) : animation.op - animation.ip) + 1;
}

const LOOP_FRAMES = getLoopFrameCount(dancerAnimation);

export function useDancerAnimationFrame(active) {
  const [frame, setFrame] = useState(dancerAnimation.ip);

  useEffect(() => {
    if (!active) {
      setFrame(dancerAnimation.ip);
      return undefined;
    }

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return undefined;
    }

    let animationFrameId;
    const startedAt = window.performance.now();

    const tick = (timestamp) => {
      const elapsedSeconds = (timestamp - startedAt) / 1000;
      const nextFrame = dancerAnimation.ip + (elapsedSeconds * dancerAnimation.fr) % LOOP_FRAMES;

      setFrame(nextFrame);
      animationFrameId = window.requestAnimationFrame(tick);
    };

    animationFrameId = window.requestAnimationFrame(tick);

    return () => window.cancelAnimationFrame(animationFrameId);
  }, [ active ]);

  return frame;
}

export function getDancerAnimationPaths(frame) {
  return dancerAnimation.layers.flatMap((layer, layerIndex) => {
    const layerPosition = readPoint(layer.ks?.p);
    const layerAnchor = readPoint(layer.ks?.a);
    const layerRotation = readScalar(layer.ks?.r);
    const layerScale = readPoint(layer.ks?.s, [ 100, 100 ]);
    const layerOpacity = readScalar(layer.ks?.o, 100) / 100;
    const transform = `translate(${layerPosition[0]} ${layerPosition[1]}) rotate(${layerRotation}) scale(${layerScale[0] / 100} ${layerScale[1] / 100}) translate(${-layerAnchor[0]} ${-layerAnchor[1]})`;

    return (layer.shapes ?? []).flatMap((shapeGroup, groupIndex) => {
      const stroke = shapeGroup.it?.find((item) => item.ty === 'st');
      const fill = shapeGroup.it?.find((item) => item.ty === 'fl');

      return (shapeGroup.it ?? [])
        .filter((item) => item.ty === 'sh' && item.hd !== true)
        .map((item, itemIndex) => {
          const shape = getKeyframeShape(item.ks.k, frame);

          return {
            d: getPathData(shape),
            fillOpacity: fill ? readScalar(fill.o, 100) / 100 : 0,
            key: `${layerIndex}-${groupIndex}-${itemIndex}`,
            strokeLinecap: getLineCap(stroke?.lc),
            strokeLinejoin: getLineJoin(stroke?.lj),
            strokeOpacity: stroke ? readScalar(stroke.o, 100) / 100 : 0,
            strokeWidth: stroke ? readScalar(stroke.w, 1) : 0,
            transform,
            opacity: layerOpacity
          };
        });
    });
  });
}
