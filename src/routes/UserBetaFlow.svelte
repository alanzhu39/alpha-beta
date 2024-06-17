<script lang="ts">
	import SelectBoundary from './SelectBoundary.svelte';
	import VideoScrubber from './VideoScrubber.svelte';
	import VideoUpload from './VideoUpload.svelte';
	import { userPerspective, type Coordinate } from './stores';
	import { calculateTransform } from '$lib';

	const STEPS = {
		VIDEO_UPLOAD: 'videoUpload',
		SELECT_BOUNDARY: 'selectBoundary',
		DISPLAY: 'display'
	};

	let currentStep = STEPS.VIDEO_UPLOAD;
	let videoSrc = '';
	let corners: Coordinate[];

	const onVideoUpload = () => {
		currentStep = STEPS.SELECT_BOUNDARY;
	};

	const onSelectedBoundary = () => {
		currentStep = STEPS.DISPLAY;
		// add boundary corners to store
		$userPerspective = [corners[0], corners[1], corners[2], corners[3]];
	};
</script>

<div class="container">
	{#if currentStep === STEPS.VIDEO_UPLOAD}
		<VideoUpload bind:videoSrc nextStep={onVideoUpload} />
	{/if}
	{#if currentStep === STEPS.SELECT_BOUNDARY}
		<SelectBoundary {videoSrc} bind:corners nextStep={onSelectedBoundary} />
	{/if}
	{#if currentStep === STEPS.DISPLAY}
		<VideoScrubber {videoSrc} />
	{/if}
</div>

<style>
	.container {
		background-color: plum;
	}
</style>
