<script lang="ts">
	import { onMount } from 'svelte';
	import type { Perspective } from './stores';
	import { default as PerspectiveTransform } from 'perspectivets';
	import { DrawingUtils, FilesetResolver, PoseLandmarker } from '@mediapipe/tasks-vision';

	export let backStep;
	export let videoSrc: string;
	export let perspectiveTransform: Perspective | null = null;
	// export let overlayPose;
	// export let poseStore;

	// Or, just pass flag for which store you should be using?

	let videoRef: HTMLVideoElement;
	let videoDuration: number;
	let canvasRef: HTMLCanvasElement;
	let rangeRef: HTMLInputElement;
	let isPlaying = false;

	let poseLandmarker: PoseLandmarker;

	onMount(async () => {
		const vision = await FilesetResolver.forVisionTasks('@mediapipe/tasks-vision/wasm');
		poseLandmarker = await PoseLandmarker.createFromOptions(vision, {
			baseOptions: {
				// modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_heavy/float16/latest/pose_landmarker_heavy.task'
				modelAssetPath:
					'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_full/float16/latest/pose_landmarker_full.task'
				// delegate: 'GPU'
			},
			// canvas: canvasRef,
			numPoses: 1,
			runningMode: 'VIDEO'
		});
	});

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
		videoWidth: number,
		videoHeight: number
	) => {
		// Draw video
		if (!perspectiveTransform) {
			context.drawImage(videoRef, 0, 0, videoWidth, videoHeight);
		} else {
			context.fillRect(0, 0, videoWidth, videoHeight);
			const p = new PerspectiveTransform(context, videoRef);
			const [topLeft, topRight, bottomRight, bottomLeft] = perspectiveTransform.map(([x, y]) => [
				x * videoWidth,
				y * videoHeight
			]);
			const [topLeftX, topLeftY] = topLeft;
			const [topRightX, topRightY] = topRight;
			const [bottomRightX, bottomRightY] = bottomRight;
			const [bottomLeftX, bottomLeftY] = bottomLeft;
			p.draw({
				topLeftX,
				topLeftY,
				topRightX,
				topRightY,
				bottomRightX,
				bottomRightY,
				bottomLeftX,
				bottomLeftY
			});
		}

		// Detect pose
		const drawingUtils = new DrawingUtils(context);
		poseLandmarker.detectForVideo(videoRef, performance.now(), (result) => {
			context.save();
			for (const landmark of result.landmarks) {
				drawingUtils.drawLandmarks(landmark, {
					lineWidth: 2,
					radius: 2
				});
				drawingUtils.drawConnectors(landmark, PoseLandmarker.POSE_CONNECTIONS, {
					lineWidth: 2
				});
			}
			context.restore();
		});

		// TODO: update poseStore
		// TODO: Draw overlayPose
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
		const videoWidth = videoRef.offsetWidth;
		const videoHeight = videoRef.offsetHeight;
		if (!context) return;

		drawFrame(context, videoWidth, videoHeight);

		// TODO: pose detection
	};

	const onPlay = () => {
		const context = canvasRef.getContext('2d');
		const canvasWidth = canvasRef.offsetWidth;
		const canvasHeight = canvasRef.offsetHeight;
		canvasRef.width = canvasWidth;
		canvasRef.height = canvasHeight;
		const videoWidth = videoRef.offsetWidth;
		const videoHeight = videoRef.offsetHeight;

		const start = performance.now();

		function step(count: number) {
			if (!isPlaying || videoRef.ended || !context) {
				console.log(`frames: ${count}`);
				console.log(`time: ${performance.now() - start}ms`);
				console.log(`fps: ${count / ((performance.now() - start) / 1000)}`);
				return;
			}

			drawFrame(context, videoWidth, videoHeight);

			// TODO: pose detection
			requestAnimationFrame(() => step(count + 1));
		}

		requestAnimationFrame(() => step(0));
	};

	const onTimeUpdate = () => {
		rangeRef.value = videoRef.currentTime.toString();
	};
</script>

<div class="container">
	<button class="back-button" on:click={backStep}>Back</button>
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
		position: relative;
	}

	.back-button {
		position: absolute;
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
