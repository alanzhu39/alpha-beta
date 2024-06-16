<script lang="ts">
	import { onMount } from 'svelte';

	export let videoSrc: string;
	// export let perspectiveTransform;
	// export let overlayPose;
	// export let poseStore;

	// Or, just pass flag for which store you should be using?

	let videoRef: HTMLVideoElement;
	let videoDuration: number;
	let canvasRef: HTMLCanvasElement;
	let rangeRef: HTMLInputElement;
	let isPlaying = false;

	$: {
		if (rangeRef && videoDuration) {
			rangeRef.max = videoDuration.toString();
		}
	}

	const onPlayClick = () => {
		isPlaying = !isPlaying;
		videoRef.play();
	};

	const onPauseClick = () => {
		isPlaying = !isPlaying;
		videoRef.pause();
	};

	const drawFrame = (
		context: CanvasRenderingContext2D,
		canvasWidth: number,
		canvasHeight: number
	) => {
		// Draw video
		context.drawImage(videoRef, 0, 0, canvasWidth, canvasHeight);
		// Detect pose and update poseStore
		// Draw overlayPose
	};

	const onInput = () => {
		videoRef.currentTime = parseFloat(rangeRef.value);
	};

	const onSeeked = () => {
		const context = canvasRef.getContext('2d');
		const canvasWidth = canvasRef.offsetWidth;
		const canvasHeight = canvasRef.offsetHeight;
		canvasRef.width = canvasWidth;
		canvasRef.height = canvasHeight;
		if (!context) return;

		drawFrame(context, canvasWidth, canvasHeight);

		// TODO: pose detection
	};

	const onPlay = () => {
		const context = canvasRef.getContext('2d');
		const canvasWidth = canvasRef.offsetWidth;
		const canvasHeight = canvasRef.offsetHeight;
		canvasRef.width = canvasWidth;
		canvasRef.height = canvasHeight;

		function step() {
			if (!isPlaying || videoRef.ended || !context) return;

			drawFrame(context, canvasWidth, canvasHeight);

			// TODO: pose detection
			requestAnimationFrame(step);
		}

		requestAnimationFrame(step);
	};

	const onTimeUpdate = () => {
		rangeRef.value = videoRef.currentTime.toString();
	};
</script>

<div class="container">
	<!-- TODO: back button -->
	<div class="video-container">
		<video
			class="user-video"
			muted
			bind:this={videoRef}
			bind:duration={videoDuration}
			on:play={onPlay}
			on:seeked={onSeeked}
			on:timeupdate={onTimeUpdate}
		>
			<source src={videoSrc} type="video/mp4" />
		</video>
		<canvas class="video-canvas" id="video-canvas" bind:this={canvasRef} />
	</div>
	<div class="controls-container">
		{#if isPlaying}
			<button on:click={onPauseClick}>Pause</button>
		{:else}
			<button on:click={onPlayClick}>Play</button>
		{/if}
		<input type="range" step="0.03" value="0" bind:this={rangeRef} on:input={onInput} />
	</div>
</div>

<style>
	.container {
		display: grid;
		grid-template-rows: minmax(0, 1fr) auto;
		height: 100%;
	}

	.video-container {
		position: relative;
		justify-self: center;
		align-self: stretch;
		min-width: 0;
		min-height: 0;
	}

	.user-video {
		max-width: 100%;
		max-height: 100%;
	}

	.video-canvas {
		position: absolute;
		z-index: 1;
		top: 0;
		left: 50%;
		transform: translateX(-50%);
		width: 100%;
		height: 100%;
	}

	.controls-container {
		padding: 10px;
		display: grid;
		grid-template-columns: auto 1fr;
		gap: 10px;
		text-align: center;
		align-items: center;
	}
</style>
