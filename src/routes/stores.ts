import { writable } from 'svelte/store';

export type Coordinate = [number, number];
export type Perspective = [Coordinate, Coordinate, Coordinate, Coordinate];

const userPerspective = writable<Perspective>();
const userPose = writable();

const referencePerspective = writable<Perspective>();
const referencePose = writable();

export { userPerspective, userPose, referencePerspective, referencePose };
