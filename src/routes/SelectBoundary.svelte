<script lang="ts">
	export let videoSrc: string;
</script>

<div class="container">
	<!-- TODO: back button -->
	<video class="user-video" controls muted>
		<source src={videoSrc} type="video/mp4" />
	</video>
	<canvas class="video-canvas" id="video-canvas"></canvas>
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
		top: 0;
		left: 0;
	}
</style>
