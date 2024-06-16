<script lang="ts">
	import SelectBoundary from './SelectBoundary.svelte';
	import VideoScrubber from './VideoScrubber.svelte';
	import VideoUpload from './VideoUpload.svelte';

	const STEPS = {
		VIDEO_UPLOAD: 'videoUpload',
		SELECT_BOUNDARY: 'selectBoundary',
		DISPLAY: 'display'
	};

	let currentStep = STEPS.VIDEO_UPLOAD;
	let files: FileList;
	let videoSrc = '';

	const onVideoUpload = () => {
		currentStep = STEPS.SELECT_BOUNDARY;
	};

	const onSelectedBoundary = () => {
		currentStep = STEPS.DISPLAY;
		// TODO: add boundary corners to store
	};
</script>

<div class="container">
	{#if currentStep === STEPS.VIDEO_UPLOAD}
		<VideoUpload bind:videoSrc nextStep={onVideoUpload} />
	{/if}
	{#if currentStep === STEPS.SELECT_BOUNDARY}
		<SelectBoundary {videoSrc} nextStep />
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
