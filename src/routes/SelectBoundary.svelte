<script lang="ts">
  import { onMount } from 'svelte';
  import type { Coordinate } from './stores';
  import VideoScrubber from './VideoScrubber.svelte';

  export let nextStep;
  export let videoSrc: string;
  // Exported corners, relative to video bounding box
  export let corners: Coordinate[] = [];

  // Local coordinates for where to draw dots on the canvas
  let videoRef: HTMLVideoElement;
  let videoDuration: number;
  let canvasRef: HTMLCanvasElement;
  let canvasCorners: Coordinate[] = [];
  let currentCorner: number = 0;
  let isDrawing: boolean = false;

  onMount(() => {
    if (canvasRef) {
      canvasRef.width = canvasRef.offsetWidth;
      canvasRef.height = canvasRef.offsetHeight;
      canvasCorners = [
        [0.1 * canvasRef.offsetWidth, 0.1 * canvasRef.offsetHeight],
        [0.9 * canvasRef.offsetWidth, 0.1 * canvasRef.offsetHeight],
        [0.9 * canvasRef.offsetWidth, 0.9 * canvasRef.offsetHeight],
        [0.1 * canvasRef.offsetWidth, 0.9 * canvasRef.offsetHeight]
      ];

      drawBoundary();
    }
  });

  const closestCorner = (canvasX: number, canvasY: number) => {
    let closest = 0;
    let minDist = Infinity;
    for (let i = 0; i < 4; i++) {
      const dist = Math.sqrt(
        (canvasX - canvasCorners[i][0]) ** 2 + (canvasY - canvasCorners[i][1]) ** 2
      );
      if (dist < minDist) {
        minDist = dist;
        closest = i;
      }
    }
    return closest;
  };

  const updateCorners = (canvasX: number, canvasY: number) => {
    const videoRect = videoRef.getBoundingClientRect();
    const canvasRect = canvasRef.getBoundingClientRect();
    corners[currentCorner] = [
      (canvasX + canvasRect.left - videoRect.left) / videoRef.offsetWidth,
      (canvasY + canvasRect.top - videoRect.top) / videoRef.offsetHeight
    ];

    canvasCorners[currentCorner] = [canvasX, canvasY];
  };

  const drawBoundary = () => {
    const context = canvasRef.getContext('2d');
    if (!context) return;

    context.clearRect(0, 0, canvasRef.width, canvasRef.height);

    // Draw boundary corners
    canvasCorners.forEach((corner) => {
      context.beginPath();
      context.arc(corner[0], corner[1], 6, 0, 2 * Math.PI);
      context.fillStyle = 'white';
      context.fill();
    });

    // Draw boundary edges
    context.beginPath();
    context.lineWidth = 2;
    context.moveTo(canvasCorners[3][0], canvasCorners[3][1]);
    canvasCorners.forEach((corner) => {
      context.lineTo(corner[0], corner[1]);
    });
    context.strokeStyle = 'white';
    context.stroke();
  };

  const getCanvasCoordsFromEvent = (e: MouseEvent | TouchEvent): Coordinate => {
    const canvasRect = canvasRef.getBoundingClientRect();

    let coord: Coordinate;
    if (e instanceof MouseEvent) {
      coord = [e.clientX - canvasRect.left, e.clientY - canvasRect.top];
    } else {
      coord = [e.touches[0].clientX - canvasRect.left, e.touches[0].clientY - canvasRect.top];
      e.preventDefault();
    }

    return coord;
  };

  const onDrawingStart = (e: MouseEvent | TouchEvent) => {
    isDrawing = true;

    // Find closest corner
    const coord = getCanvasCoordsFromEvent(e);
    currentCorner = closestCorner(coord[0], coord[1]);
    updateCorners(coord[0], coord[1]);

    function step() {
      if (!isDrawing) return;
      drawBoundary();
      requestAnimationFrame(step);
    }

    requestAnimationFrame(step);
  };

  const onDrawingMove = (e: MouseEvent | TouchEvent) => {
    if (!isDrawing) return;
    updateCorners(...getCanvasCoordsFromEvent(e));
  };

  const onDrawingEnd = (e: MouseEvent | TouchEvent) => {
    isDrawing = false;
    updateCorners(...getCanvasCoordsFromEvent(e));
    drawBoundary();
  };

  const onScrub = (e: CustomEvent<number>) => {
    videoRef.currentTime = e.detail * videoDuration;
  };

  const onDone = () => {
    nextStep();
  };
</script>

<div class="container">
  <!-- TODO: back button -->
  <div class="video-container">
    <video
      class="user-video"
      muted
      playsinline
      crossOrigin="anonymous"
      bind:this={videoRef}
      bind:duration={videoDuration}
    >
      <source src={videoSrc} type="video/mp4" />
    </video>
    <canvas
      class="video-canvas"
      id="video-canvas"
      bind:this={canvasRef}
      on:mousedown={onDrawingStart}
      on:mousemove={onDrawingMove}
      on:mouseup={onDrawingEnd}
      on:touchstart={onDrawingStart}
      on:touchmove={onDrawingMove}
      on:touchend={onDrawingEnd}
    />
  </div>
  <div class="controls">
    <VideoScrubber on:scrub={onScrub} {videoDuration} />
    <!-- Instructions -->
    <div class="instructions-container">
      <span>Select the boundary of the MoonBoard in the video.</span>
      <button class="done-button" on:click={onDone}>Done</button>
    </div>
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

  .controls {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    gap: 10px;
    padding: 10px;
  }

  .instructions-container {
    display: flex;
    gap: 10px;
    text-align: center;
    align-items: center;
    justify-content: center;
  }

  .done-button {
    border: none;
    font-size: 15px;
    background-color: var(--background-color-pink);
    color: var(--text-color-black);
    padding: 7px 11px;
    border-radius: 50px;
    cursor: pointer;
  }
</style>
