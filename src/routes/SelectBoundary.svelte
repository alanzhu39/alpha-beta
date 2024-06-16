<script lang="ts">
	export let videoSrc: string;

	let videoRef: HTMLVideoElement | null = null;
	let canvasRef: HTMLCanvasElement | null = null;

	$: {
		if (videoRef && canvasRef) {
			console.log(videoRef);
			console.log(videoRef.getBoundingClientRect());
			canvasRef.width = videoRef.offsetWidth;
			canvasRef.height = videoRef.offsetHeight;
		}
	}
</script>

<div class="container">
	<!-- TODO: back button -->
	<video class="user-video" muted bind:this={videoRef}>
		<source src={videoSrc} type="video/mp4" />
	</video>
	<canvas class="video-canvas" id="video-canvas" bind:this={canvasRef}></canvas>
	<!-- TODO: point selection canvas -->
	<!-- TODO: bottom text and button -->
	<p>Bottom text</p>
</div>

<style>
	.container {
		display: grid;
		grid-template-rows: minmax(0, 1fr) auto;
		position: relative;
		height: 100%;
	}

	.user-video {
		justify-self: center;
		align-self: stretch;
	}

	.video-canvas {
		position: absolute;
		z-index: 1;
		top: 0;
		left: 50%;
		transform: translateX(-50%);
	}
</style>
