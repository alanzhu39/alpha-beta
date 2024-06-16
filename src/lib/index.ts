import type { Coordinate } from '../routes/stores';

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
) {
	const [a1, b1, c1] = getCoefficients(...line1);
	const [a2, b2, c2] = getCoefficients(...line2);
	const d = a1 * b2 - a2 * b1;
	const x = (b1 * c2 - b2 * c1) / d;
	const y = (a2 * c1 - a1 * c2) / d;
	return [x, y];
}

export function calculateTransform(source_coords: Coordinate[], dest_coords: Coordinate[]) {
	// TODO: calculate perspective for reference beta
	return;
}

// def calculateTransform(source_coords: Coordinates, dest_coords: Coordinates) -> Coordinates:
//     a, b, c, d = 'a', 'b', 'c', 'd'
//     sa, sb, sc, sd = source_coords
//     da, db, dc, dd = dest_coords

//     def calculateIntersectionDest(coord1: str, coord2: str, s3: Coordinate):
//         coords_map = {
//             a: (sa, da),
//             b: (sb, db),
//             c: (sc, dc),
//             d: (sd, dd),
//         }
//         s1, d1 = coords_map[coord1]
//         s2, d2 = coords_map[coord2]

//         # Given mapping s1 -> d1, s2 -> d2
//         # and s1, s2, s3 are colinear as s1 -> s2 -> s3
//         # calculate d3
//         dist_s1_s2 = distance(s1, s2)
//         dist_d1_d2 = distance(d1, d2)
//         scaling_factor = dist_d1_d2 / dist_s1_s2
//         direction = (d2[0] - d1[0], d2[1] - d1[1])
//         dist_s3_s2 = distance(s3, s2)
//         dist_d3_d2 = scaling_factor * dist_s3_s2
//         return (d2[0] + direction[0] * dist_d3_d2, d2[1] + direction[1] * dist_d3_d2)

//     # Calculate intersections i1-8
//     # c1 1 2 c2
//     # 8  A B 3
//     # 7  C D 4
//     # c3 6 5 c4
//     calc_y, _ = makeLine(sa, sb)
//     i8 = (0, calc_y(0))
//     i3 = (1, calc_y(1))
//     calc_y, _ = makeLine(sc, sd)
//     i7 = (0, calc_y(0))
//     i4 = (1, calc_y(1))
//     _, calc_x = makeLine(sa, sc)
//     i1 = (calc_x(0), 0)
//     i6 = (calc_x(1), 1)
//     _, calc_x = makeLine(sb, sd)
//     i2 = (calc_x(0), 0)
//     i5 = (calc_x(1), 1)

//     # Calculate dest coordinate representations for i1-8
//     intersections = (
//         (i8, a, b, i3),
//         (i7, c, d, i4),
//         (i1, a, c, i6),
//         (i2, b, d, i5),
//     )
//     d8 = calculateIntersectionDest(b, a, i8)
//     d3 = calculateIntersectionDest(a, b, i3)
//     d7 = calculateIntersectionDest(d, c, i7)
//     d4 = calculateIntersectionDest(c, d, i4)
//     d1 = calculateIntersectionDest(c, a, i1)
//     d6 = calculateIntersectionDest(a, c, i6)
//     d2 = calculateIntersectionDest(d, b, i2)
//     d5 = calculateIntersectionDest(b, d, i5)

//     # Calculate dest corners using intersection dest representations
//     c1 = calculateLineIntersection((d1, d2), (d7, d8))
//     c2 = calculateLineIntersection((d1, d2), (d3, d4))
//     c3 = calculateLineIntersection((d5, d6), (d7, d8))
//     c4 = calculateLineIntersection((d5, d6), (d3, d4))
//     return (c1, c2, c3, c4)

// if __name__ == '__main__':
//     source_coords = (
//         (0.1, 0.062),
//         (0.811, 0),
//         (0.256, 0.842),
//         (0.816, 0.828)
//     )
//     dest_coords = (
//         (0.2, 0.2),
//         (0.8, 0.2),
//         (0.2, 0.8),
//         (0.8, 0.8)
//     )
//     res = calculateTransform(source_coords, dest_coords)
//     coord_strings = (f'{x[0]:.3f}*W:{x[1]:.3f}*H' for x in res)
//     # Output is used in ffmpeg perspective filter, eg.
//     # $ ffmpeg -i beta.MOV -vf pad=iw+4:ih+4:-1:-1,perspective=0.155*W:0.169*H:0.896*W:0.205*H:0.022*W:0.872*H:0.921*W:0.875*H:sense=destination output.MOV -y
//     print(':'.join(coord_strings))
