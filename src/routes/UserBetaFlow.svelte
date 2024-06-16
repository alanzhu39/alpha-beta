<script lang="ts">
	import SelectBoundary from './SelectBoundary.svelte';
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
</script>

<div class="container">
	{#if currentStep === STEPS.VIDEO_UPLOAD}
		<VideoUpload bind:videoSrc nextStep={onVideoUpload} />
	{/if}
	{#if currentStep === STEPS.SELECT_BOUNDARY}
		<SelectBoundary {videoSrc} />
	{/if}
</div>

<style>
	.container {
		background-color: plum;
	}
</style>
