<script lang="ts">
	import type { Coordinate } from './stores';

	const CORNERS = ['Top left (18A)', 'Top right (18K)', 'Bottom right (1K)', 'Bottom left (1A)'];

	export let nextStep;
	export let videoSrc: string;
	export let corners: Coordinate[] = [];

	let videoRef: HTMLVideoElement | null = null;
	let canvasRef: HTMLCanvasElement | null = null;
	let currentCorner = 0;

	const drawCorners = () => {
		if (!canvasRef || !videoRef) return;
		canvasRef.width = canvasRef.offsetWidth;
		canvasRef.height = canvasRef.offsetHeight;
		const videoWidth = videoRef.offsetWidth;
		const videoHeight = videoRef.offsetHeight;
		const context = canvasRef.getContext('2d');
		if (!context) return;
		context.clearRect(0, 0, videoWidth, videoHeight);
		corners.forEach((corner, index) => {
			context.beginPath();
			context.arc(corner[0] * videoWidth, corner[1] * videoHeight, 5, 0, 2 * Math.PI);
			context.fillStyle = index === currentCorner ? 'red' : 'green';
			context.fill();
		});
	};

	const onCanvasClick = (e: MouseEvent) => {
		if (!canvasRef || !videoRef) return;
		const videoWidth = videoRef.offsetWidth;
		const videoHeight = videoRef.offsetHeight;
		const rect = canvasRef.getBoundingClientRect();
		const x = (e.clientX - rect.left) / videoWidth;
		const y = (e.clientY - rect.top) / videoHeight;
		corners[currentCorner] = [x, y];
		drawCorners();
	};

	const onBack = () => {
		currentCorner--;
		corners.pop();
		drawCorners();
	};

	const onNext = () => {
		currentCorner++;
		drawCorners();
	};

	const onDone = () => {
		nextStep();
	};
</script>

<div class="container">
	<!-- TODO: back button -->
	<div class="video-container">
		<video class="user-video" muted bind:this={videoRef}>
			<source src={videoSrc} type="video/mp4" />
		</video>
		<canvas class="video-canvas" id="video-canvas" bind:this={canvasRef} on:click={onCanvasClick} />
	</div>
	<!-- Instructions -->
	<div class="instructions-container">
		<span>Select each corner hold of the MoonBoard.</span>
		<span>
			{#if currentCorner < CORNERS.length - 1}
				Now selecting: <b>{CORNERS[currentCorner]}</b>
			{/if}
		</span>
		{#if currentCorner > 0}
			<button on:click={onBack}>Back</button>
		{:else}
			<div />
		{/if}
		{#if currentCorner < CORNERS.length - 1}
			<button on:click={onNext}>Next</button>
		{:else}
			<button on:click={onDone}>Done</button>
		{/if}
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

	.instructions-container {
		padding: 10px;
		display: grid;
		grid-template-columns: auto 2fr 1fr 1fr;
		gap: 10px;
		text-align: center;
		align-items: center;
	}
</style>
