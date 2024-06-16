import { writable } from 'svelte/store';

const userPerspective = writable(null);
const userPose = writable(null);

const referencePerspective = writable(null);
const referencePose = writable(null);

export { userPerspective, userPose, referencePerspective, referencePose };
