<script lang="ts">
	export let videoSrc: string;

	let canvasRef: HTMLCanvasElement | null = null;
</script>

<div class="container">
	<!-- TODO: back button -->
	<div class="video-container">
		<video class="user-video" muted>
			<source src={videoSrc} type="video/mp4" />
		</video>
		<canvas class="video-canvas" id="video-canvas" bind:this={canvasRef}></canvas>
	</div>
	<!-- TODO: point selection canvas -->
	<!-- TODO: bottom text and button -->
	<p>Bottom text</p>
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
</style>
