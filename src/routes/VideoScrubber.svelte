<script lang="ts">
	export let videoSrc: string;

	let videoRef: HTMLVideoElement | null = null;
	let canvasRef: HTMLCanvasElement | null = null;

	const onPlay = () => {
		if (!canvasRef || !videoRef) return;
		const context = canvasRef.getContext('2d');
		const canvasWidth = canvasRef.offsetWidth;
		const canvasHeight = canvasRef.offsetHeight;
		canvasRef.width = canvasWidth;
		canvasRef.height = canvasHeight;
		if (!context) return;

		function step() {
			if (!canvasRef || !videoRef || !context) return;
			context.drawImage(videoRef, 0, 0, canvasWidth, canvasHeight);

			requestAnimationFrame(step);
		}

		requestAnimationFrame(step);
	};
</script>

<div class="container">
	<!-- TODO: back button -->
	<div class="video-container">
		<video class="user-video" muted bind:this={videoRef}>
			<source src={videoSrc} type="video/mp4" />
		</video>
		<canvas class="video-canvas" id="video-canvas" bind:this={canvasRef} on:click={onPlay} />
	</div>
	<!-- TODO: scrubber -->
</div>

<style>
</style>
