<script lang="ts">
  import type { Coordinate } from './stores';

  const CORNERS = ['Top left (18A)', 'Top right (18K)', 'Bottom right (1K)', 'Bottom left (1A)'];

  export let nextStep;
  export let videoSrc: string;
  // Exported corners, relative to video bounding box
  export let corners: Coordinate[] = [];

  // Local coordinates for where to draw dots on the canvas
  let canvasDots: Coordinate[] = [];
  let videoRef: HTMLVideoElement;
  let videoDuration: number;
  let canvasRef: HTMLCanvasElement;
  let rangeRef: HTMLInputElement;
  let currentCorner = 0;

  $: {
    if (rangeRef && videoDuration) {
      rangeRef.max = videoDuration.toString();
    }
  }

  const drawDots = () => {
    canvasRef.width = canvasRef.offsetWidth;
    canvasRef.height = canvasRef.offsetHeight;
    const videoWidth = videoRef.offsetWidth;
    const videoHeight = videoRef.offsetHeight;
    const context = canvasRef.getContext('2d');
    if (!context) return;
    context.clearRect(0, 0, videoWidth, videoHeight);
    canvasDots.forEach((dot, index) => {
      context.beginPath();
      context.arc(dot[0], dot[1], 5, 0, 2 * Math.PI);
      context.fillStyle = index === currentCorner ? 'red' : 'green';
      context.fill();
    });
  };

  const onCanvasClick = (e: MouseEvent) => {
    const videoWidth = videoRef.offsetWidth;
    const videoHeight = videoRef.offsetHeight;
    const videoRect = videoRef.getBoundingClientRect();
    const x = (e.clientX - videoRect.left) / videoWidth;
    const y = (e.clientY - videoRect.top) / videoHeight;
    corners[currentCorner] = [x, y];

    const canvasRect = canvasRef.getBoundingClientRect();
    canvasDots[currentCorner] = [e.clientX - canvasRect.left, e.clientY - canvasRect.top];

    drawDots();
  };

  const onInput = () => {
    videoRef.currentTime = parseFloat(rangeRef.value);
  };

  const onBack = () => {
    currentCorner--;
    corners.pop();
    canvasDots.pop();
    drawDots();
  };

  const onNext = () => {
    currentCorner++;
    drawDots();
  };

  const onDone = () => {
    nextStep();
  };
</script>

<div class="container">
  <!-- TODO: back button -->
  <div class="video-container">
    <video class="user-video" muted bind:this={videoRef} bind:duration={videoDuration}>
      <source src={videoSrc} type="video/mp4" />
    </video>
    <canvas class="video-canvas" id="video-canvas" bind:this={canvasRef} on:click={onCanvasClick} />
  </div>
  <input type="range" step="0.03" value="0" bind:this={rangeRef} on:input={onInput} />
  <!-- Instructions -->
  <div class="instructions-container">
    <span>Select each corner hold of the MoonBoard.</span>
    <span>Now selecting: <b>{CORNERS[currentCorner]}</b></span>
    {#if currentCorner > 0}
      <button on:click={onBack}>Back</button>
    {:else}
      <div />
    {/if}
    {#if currentCorner < CORNERS.length - 1}
      <button on:click={onNext} disabled={corners[currentCorner] === undefined}>Next</button>
    {:else}
      <button on:click={onDone} disabled={corners[currentCorner] === undefined}>Done</button>
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
    justify-self: stretch;
    align-self: stretch;
    min-width: 0;
    min-height: 0;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .user-video {
    display: block;
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
