import type { NormalizedLandmark } from '@mediapipe/tasks-vision';
import type { Coordinate, Perspective } from '../routes/stores';

function distance(coord1: Coordinate, coord2: Coordinate) {
  return Math.sqrt(Math.pow(coord1[0] - coord2[0], 2) + Math.pow(coord1[1] - coord2[1], 2));
}

function makeLine(coord1: Coordinate, coord2: Coordinate) {
  const [x1, y1] = coord1;
  const [x2, y2] = coord2;
  const calcY = (x: number) => ((x - x1) * (y2 - y1)) / (x2 - x1) + y1;
  const calcX = (y: number) => ((y - y1) * (x2 - x1)) / (y2 - y1) + x1;
  return [calcY, calcX];
}

function getCoefficients(coord1: Coordinate, coord2: Coordinate) {
  const [x1, y1] = coord1;
  const [x2, y2] = coord2;
  const a = y2 - y1;
  const b = x1 - x2;
  const c = (x2 - x1) * y1 - (y2 - y1) * x1;
  return [a, b, c];
}

function calculateLineIntersection(
  line1: [Coordinate, Coordinate],
  line2: [Coordinate, Coordinate]
): Coordinate {
  const [a1, b1, c1] = getCoefficients(...line1);
  const [a2, b2, c2] = getCoefficients(...line2);
  const d = a1 * b2 - a2 * b1;
  const x = (b1 * c2 - b2 * c1) / d;
  const y = (a2 * c1 - a1 * c2) / d;
  return [x, y];
}

export function calculateTransform(
  sourceCoords: Coordinate[],
  destCoords: Coordinate[]
): Perspective {
  const [a, b, c, d] = ['a', 'b', 'c', 'd'] as const;
  const [sa, sb, sc, sd] = sourceCoords;
  const [da, db, dc, dd] = destCoords;
  const coordsMap = {
    a: [sa, da],
    b: [sb, db],
    c: [sc, dc],
    d: [sd, dd]
  };

  function calculateIntersectionDest(
    coord1: keyof typeof coordsMap,
    coord2: keyof typeof coordsMap,
    s3: Coordinate
  ): Coordinate {
    const [s1, d1] = coordsMap[coord1];
    const [s2, d2] = coordsMap[coord2];

    // Given mapping s1 -> d1, s2 -> d2
    // and s1, s2, s3 are colinear as s1 -> s2 -> s3
    // calculate d3
    const dist_s1_s2 = distance(s1, s2);
    const dist_d1_d2 = distance(d1, d2);
    const scaling_factor = dist_d1_d2 / dist_s1_s2;
    const direction = [d2[0] - d1[0], d2[1] - d1[1]];
    const dist_s3_s2 = distance(s3, s2);
    const dist_d3_d2 = scaling_factor * dist_s3_s2;
    return [d2[0] + direction[0] * dist_d3_d2, d2[1] + direction[1] * dist_d3_d2];
  }

  // Calculate intersections i1-8
  // c1 1 2 c2
  // 8  A B 3
  // 7  D C 4
  // c4 6 5 c3
  let [calcY] = makeLine(sa, sb);
  const i8 = [0, calcY(0)] as Coordinate;
  const i3 = [1, calcY(1)] as Coordinate;
  [calcY] = makeLine(sc, sd);
  const i7 = [0, calcY(0)] as Coordinate;
  const i4 = [1, calcY(1)] as Coordinate;
  let [, calcX] = makeLine(sa, sd);
  const i1 = [calcX(0), 0] as Coordinate;
  const i6 = [calcX(1), 1] as Coordinate;
  [, calcX] = makeLine(sb, sc);
  const i2 = [calcX(0), 0] as Coordinate;
  const i5 = [calcX(1), 1] as Coordinate;

  // Calculate dest coordinate representations for i1-8
  // const intersections = [
  //   [i8, a, b, i3],
  //   [i7, d, c, i4],
  //   [i1, a, d, i6],
  //   [i2, b, c, i5]
  // ]
  const d8 = calculateIntersectionDest(b, a, i8);
  const d3 = calculateIntersectionDest(a, b, i3);
  const d7 = calculateIntersectionDest(c, d, i7);
  const d4 = calculateIntersectionDest(d, c, i4);
  const d1 = calculateIntersectionDest(d, a, i1);
  const d6 = calculateIntersectionDest(a, d, i6);
  const d2 = calculateIntersectionDest(c, b, i2);
  const d5 = calculateIntersectionDest(b, c, i5);

  // Calculate dest corners using intersection dest representations
  const c1 = calculateLineIntersection([d1, d2], [d7, d8]);
  const c2 = calculateLineIntersection([d1, d2], [d3, d4]);
  const c3 = calculateLineIntersection([d5, d6], [d3, d4]);
  const c4 = calculateLineIntersection([d5, d6], [d7, d8]);
  return [c1, c2, c3, c4];
}

function applyTransformToPoint(point: Coordinate, transform: Perspective) {
  // Transform:
  // 0    1
  // h1 p h2
  // 3    2
  const [t0, t1, t2, t3] = transform;
  const [x, y] = point;

  // Horizontal line
  const h1x = t0[0] * y + t3[0] * (1 - y);
  const h1y = t0[1] * y + t3[1] * (1 - y);
  const h2x = t1[0] * y + t2[0] * (1 - y);
  const h2y = t1[1] * y + t2[1] * (1 - y);

  // Find intersection
  return [h1x * x + h2x * (1 - x), h1y * y + h2y * (1 - y)];
}

export function applyTransformToPose(pose: NormalizedLandmark[], transform: Perspective) {
  console.log(transform);
  console.log(pose);
  return pose.map((landmark) => {
    const [x, y] = applyTransformToPoint([landmark.x, landmark.y], transform);
    return {
      ...landmark,
      x,
      y
    };
  });
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function test() {
  const source_coords = [
    [0.1, 0.062],
    [0.811, 0],
    [0.816, 0.828],
    [0.256, 0.842]
  ] as Perspective;
  const dest_coords = [
    [0.2, 0.2],
    [0.8, 0.2],
    [0.8, 0.8],
    [0.2, 0.8]
  ] as Perspective;
  console.log(calculateTransform(source_coords, dest_coords));
}
