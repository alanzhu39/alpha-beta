<script lang="ts">
  import { clamp, timestampFromSeconds } from '$lib/math';
  import { createEventDispatcher, onMount } from 'svelte';

  export let scrubberPosition: number = 0;
  export let videoDuration: number = 0;

  let canvasRef: HTMLCanvasElement;
  let currPosition: number = 0;
  let isDrawing: boolean = false;

  const scrubberBarWidth = 5;
  const inlinePadding = 10;
  let scrubberWidth: number;

  $: {
    currPosition = scrubberPosition;
    if (canvasRef) drawScrubber();
  }

  const dispatch = createEventDispatcher<{ scrub: number }>();

  onMount(() => {
    if (canvasRef) {
      canvasRef.width = canvasRef.offsetWidth;
      canvasRef.height = canvasRef.offsetHeight;
      scrubberWidth = canvasRef.width - 2 * inlinePadding;
      drawScrubber();
    }
  });

  const getOffsetFromEvent = (e: MouseEvent | TouchEvent) => {
    const canvasRect = canvasRef.getBoundingClientRect();
    if (e instanceof MouseEvent) {
      currPosition = clamp((e.clientX - canvasRect.left - inlinePadding) / scrubberWidth, 0, 1);
    } else {
      currPosition = clamp(
        (e.touches[0].clientX - canvasRect.left - inlinePadding) / scrubberWidth,
        0,
        1
      );
      e.preventDefault();
    }
  };

  const drawScrubber = () => {
    const context = canvasRef.getContext('2d');
    if (!context) return;
    context.clearRect(0, 0, canvasRef.width, canvasRef.height);

    // Draw scrubber bar
    context.beginPath();
    context.roundRect(
      inlinePadding + currPosition * scrubberWidth - scrubberBarWidth / 2,
      0,
      scrubberBarWidth,
      canvasRef.height,
      10
    );
    context.fillStyle = '#e6e6e6';
    context.fill();
  };

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      currPosition = Math.max(0, currPosition - 0.01);
      drawScrubber();
      dispatch('scrub', currPosition);
    } else if (e.key === 'ArrowRight') {
      currPosition = Math.min(1, currPosition + 0.01);
      drawScrubber();
      dispatch('scrub', currPosition);
    }
  };

  const onCanvasDown = (e: MouseEvent | TouchEvent) => {
    function step() {
      if (!isDrawing) return;
      drawScrubber();
      requestAnimationFrame(step);
    }

    isDrawing = true;
    getOffsetFromEvent(e);
    dispatch('scrub', currPosition);
    requestAnimationFrame(step);
  };

  const onCanvasMove = (e: MouseEvent | TouchEvent) => {
    if (!isDrawing) return;
    getOffsetFromEvent(e);
    dispatch('scrub', currPosition);
  };

  const onCanvasUp = () => {
    isDrawing = false;
  };
</script>

<div class="wrapper">
  <div class="scrubber-container">
    <!-- svelte-ignore a11y-positive-tabindex "Setting non-zero tabindex to make the scrubber canvas focusable" -->
    <canvas
      class="scrubber"
      bind:this={canvasRef}
      on:keydown={onKeyDown}
      on:mousedown={onCanvasDown}
      on:mousemove={onCanvasMove}
      on:mouseup={onCanvasUp}
      on:mouseleave={onCanvasUp}
      on:touchstart={onCanvasDown}
      on:touchmove={onCanvasMove}
      on:touchend={onCanvasUp}
      on:touchcancel={onCanvasUp}
      tabindex="1"
    />
    <div class="background" />
  </div>
  <p class="timestamp">
    {timestampFromSeconds(currPosition * videoDuration)}/{timestampFromSeconds(videoDuration)}
  </p>
</div>

<style>
  .wrapper {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .timestamp {
    margin: 0;
    font-size: 13px;
  }

  .scrubber-container {
    flex-grow: 1;
    position: relative;
    height: 30px;
  }

  .background {
    box-sizing: border-box;
    margin: 3px 0;
    height: calc(100% - 6px);
    border-radius: 7px;
    background-color: var(--background-color-gray);
    border: 1px solid var(--text-color-white);
  }

  .scrubber {
    display: block;
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    cursor: pointer;

    &:focus-visible {
      outline: none;
    }
  }
</style>
