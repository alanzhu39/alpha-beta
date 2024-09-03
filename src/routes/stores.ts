import type { NormalizedLandmark } from '@mediapipe/tasks-vision';
import { writable } from 'svelte/store';

export type Coordinate = [number, number];
export type Perspective = [Coordinate, Coordinate, Coordinate, Coordinate];

export const userPerspective = writable<Perspective>();
export const userPose = writable<NormalizedLandmark[]>();
export const userPoseColor = writable<string>('white');
export const userCanvasDimensions = writable<[number, number]>();

export const referencePerspective = writable<Perspective>();
export const referencePose = writable<NormalizedLandmark[]>();
export const referencePoseColor = writable<string>('blue');

export const isMobile = writable(false);
