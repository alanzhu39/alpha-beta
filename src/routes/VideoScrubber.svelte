<script lang="ts">
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
