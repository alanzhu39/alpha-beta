<script lang="ts">
	import { onMount } from 'svelte';
	import { default as PerspectiveTransform } from 'perspectivets';
	import {
		DrawingUtils,
		FilesetResolver,
		PoseLandmarker,
		type NormalizedLandmark
	} from '@mediapipe/tasks-vision';
	import {
		referencePose,
		referencePoseColor,
		referenceTransform,
		userPose,
		userPoseColor
	} from './stores';

	export let backStep;
	export let videoSrc: string;
	export let isReference: boolean = false;

	let videoRef: HTMLVideoElement;
	let videoDuration: number;
	let detectionCanvasRef: HTMLCanvasElement;
	let displayCanvasRef: HTMLCanvasElement;
	let rangeRef: HTMLInputElement;
	let isPlaying = false;

	let poseLandmarker: PoseLandmarker;

	onMount(async () => {
		const vision = await FilesetResolver.forVisionTasks('@mediapipe/tasks-vision/wasm');
		poseLandmarker = await PoseLandmarker.createFromOptions(vision, {
			baseOptions: {
				// modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_heavy/float16/latest/pose_landmarker_heavy.task'
				modelAssetPath:
					'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_full/float16/latest/pose_landmarker_full.task',
				delegate: 'GPU'
			},
			canvas: detectionCanvasRef,
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
		if (isReference) {
			drawFrameAsReference(context, videoWidth, videoHeight);
		} else {
			drawFrameAsUser(context, videoWidth, videoHeight);
		}
	};

	const drawLandmark = (
		drawingUtils: DrawingUtils,
		landmark: NormalizedLandmark[],
		color: string
	) => {
		drawingUtils.drawLandmarks(landmark, {
			lineWidth: 2,
			radius: 2,
			color
		});
		drawingUtils.drawConnectors(landmark, PoseLandmarker.POSE_CONNECTIONS, {
			lineWidth: 2,
			color
		});
	};

	const drawFrameAsUser = (
		context: CanvasRenderingContext2D,
		videoWidth: number,
		videoHeight: number
	) => {
		// Just draw the frame
		context.drawImage(videoRef, 0, 0, videoWidth, videoHeight);

		// Detect pose
		const drawingUtils = new DrawingUtils(context);
		poseLandmarker.detectForVideo(videoRef, performance.now(), (result) => {
			context.save();
			for (const landmark of result.landmarks) {
				// Draw user pose
				drawLandmark(drawingUtils, landmark, $userPoseColor);

				// Draw overlay pose
				drawLandmark(drawingUtils, $referencePose, $referencePoseColor);

				// update poseStore
				$userPose = landmark;
			}
			context.restore();
		});
	};

	const drawFrameAsReference = (
		context: CanvasRenderingContext2D,
		videoWidth: number,
		videoHeight: number
	) => {
		// Draw frame with perspective shift
		context.fillRect(0, 0, videoWidth, videoHeight);

		// Detect pose
		const drawingUtils = new DrawingUtils(context);
		poseLandmarker.detectForVideo(videoRef, performance.now(), (result) => {
			context.save();
			for (const landmark of result.landmarks) {
				// Draw user pose
				drawLandmark(drawingUtils, landmark, $referencePoseColor);

				// Draw overlay pose
				drawLandmark(drawingUtils, $userPose, $userPoseColor);

				// update poseStore
				$referencePose = landmark;
			}
			context.restore();
		});

		const p = new PerspectiveTransform(context, displayCanvasRef);
		const [topLeft, topRight, bottomRight, bottomLeft] = $referenceTransform.map(([x, y]) => [
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
	};

	const onInput = () => {
		videoRef.currentTime = parseFloat(rangeRef.value);
	};

	const onSeeked = () => {
		const context = displayCanvasRef.getContext('2d');
		const canvasWidth = displayCanvasRef.offsetWidth;
		const canvasHeight = displayCanvasRef.offsetHeight;
		displayCanvasRef.width = canvasWidth;
		displayCanvasRef.height = canvasHeight;
		const videoWidth = videoRef.offsetWidth;
		const videoHeight = videoRef.offsetHeight;
		if (!context) return;

		drawFrame(context, videoWidth, videoHeight);
	};

	const onPlay = () => {
		const context = displayCanvasRef.getContext('2d');
		const canvasWidth = displayCanvasRef.offsetWidth;
		const canvasHeight = displayCanvasRef.offsetHeight;
		displayCanvasRef.width = canvasWidth;
		displayCanvasRef.height = canvasHeight;
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
		<canvas class="detection-canvas" bind:this={detectionCanvasRef} />
		<canvas class="display-canvas" bind:this={displayCanvasRef} />
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

	.detection-canvas {
		position: absolute;
		z-index: -1;
		top: 0;
		left: 50%;
		transform: translateX(-50%);
		width: 100%;
		height: 100%;
	}

	.display-canvas {
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
