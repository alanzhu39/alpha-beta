<script lang="ts">
  import { onMount } from 'svelte';
  import * as fx from 'glfx-es6';
  import type { GlfxCanvas, GlfxTexture, GlfxCoordinates } from 'glfx-es6';
  import {
    DrawingUtils,
    FilesetResolver,
    PoseLandmarker,
    type NormalizedLandmark
  } from '@mediapipe/tasks-vision';
  import {
    referencePerspective,
    referencePose,
    referencePoseColor,
    userPerspective,
    userPose,
    userPoseColor,
    type Perspective
  } from './stores';
  import { calculateTransform } from '$lib';

  export let backStep;
  export let videoSrc: string;
  export let isReference: boolean = false;

  let videoRef: HTMLVideoElement;
  let videoDuration: number;
  let detectionCanvasRef: HTMLCanvasElement;
  let displayCanvasRef: HTMLCanvasElement;
  let frameCanvasRef: HTMLCanvasElement;
  let rangeRef: HTMLInputElement;
  let isPlaying = false;

  let poseLandmarker: PoseLandmarker;
  let referenceTransform: Perspective | null = null;
  let glfxCanvas: GlfxCanvas;

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
    if (isReference) {
      glfxCanvas = fx.canvas();
      glfxCanvas.className = frameCanvasRef.className;
      frameCanvasRef.replaceWith(glfxCanvas);
      frameCanvasRef = glfxCanvas;
    }
  });

  $: {
    if (rangeRef && videoDuration) {
      rangeRef.max = videoDuration.toString();
    }
  }

  $: {
    if ($referencePerspective && $userPerspective) {
      referenceTransform = calculateTransform($referencePerspective, $userPerspective);
    }
  }

  $: {
    if (
      isReference &&
      $userPose &&
      !isPlaying &&
      displayCanvasRef &&
      videoRef &&
      detectionCanvasRef
    ) {
      // TODO: draw perspective shifted frame
      const context = displayCanvasRef.getContext('2d');
      if (context) {
        drawFrameAsReference(context, videoRef.offsetWidth, videoRef.offsetHeight, false);
      }
    }
  }

  $: {
    if (
      !isReference &&
      $referencePose &&
      !isPlaying &&
      displayCanvasRef &&
      videoRef &&
      detectionCanvasRef
    ) {
      const context = displayCanvasRef.getContext('2d');
      if (context) {
        drawFrameAsUser(context, videoRef.offsetWidth, videoRef.offsetHeight, false);
      }
    }
  }

  const onPlayClick = () => {
    isPlaying = true;
    videoRef.play();
  };

  const onPauseClick = () => {
    isPlaying = false;
    videoRef.pause();
  };

  const drawFrame = (
    context: CanvasRenderingContext2D,
    frameWidth: number,
    frameHeight: number,
    detectPose: boolean = true
  ) => {
    if (isReference) {
      drawFrameAsReference(context, frameWidth, frameHeight, detectPose);
    } else {
      drawFrameAsUser(context, frameWidth, frameHeight, detectPose);
    }
  };

  const drawFrameAsUser = (
    context: CanvasRenderingContext2D,
    frameWidth: number,
    frameHeight: number,
    detectPose: boolean
  ) => {
    // Just draw the frame
    context.drawImage(videoRef, 0, 0, frameWidth, frameHeight);

    // Draw overlay reference pose
    const drawingUtils = new DrawingUtils(context);
    drawLandmark(drawingUtils, $referencePose, $referencePoseColor);

    // Detect pose
    if (detectPose) {
      poseLandmarker.detectForVideo(videoRef, performance.now(), (result) => {
        context.save();
        for (const landmark of result.landmarks) {
          // Draw user pose
          drawLandmark(drawingUtils, landmark, $userPoseColor);

          // update poseStore
          $userPose = landmark;
        }
        context.restore();
      });
    } else {
      // Just draw user pose
      drawLandmark(drawingUtils, $userPose, $userPoseColor);
    }
  };

  const drawFrameAsReference = (
    context: CanvasRenderingContext2D,
    frameWidth: number,
    frameHeight: number,
    detectPose: boolean
  ) => {
    const texture: GlfxTexture = glfxCanvas.texture(videoRef);
    const frameContext: GlfxCanvas = glfxCanvas.draw(texture);

    if (referenceTransform) {
      // Draw frame with perspective shift
      const videoWidth = videoRef.videoWidth;
      const videoHeight = videoRef.videoHeight;

      const before: GlfxCoordinates = [
        0,
        0,
        videoWidth,
        0,
        videoWidth,
        videoHeight,
        0,
        videoHeight
      ];
      const after = referenceTransform.flatMap(([x, y]) => [
        x * videoWidth,
        y * videoHeight
      ]) as GlfxCoordinates;
      frameContext.perspective(before, after).update();
    } else {
      // Draw frame without perspective shift
      frameContext.update();
    }

    context.clearRect(0, 0, frameWidth, frameHeight);

    // Draw overlay user pose
    const drawingUtils = new DrawingUtils(context);
    drawLandmark(drawingUtils, $userPose, $userPoseColor);

    // Detect pose
    if (detectPose) {
      poseLandmarker.detectForVideo(frameCanvasRef, performance.now(), (result) => {
        context.save();
        for (const landmark of result.landmarks) {
          // Draw reference pose
          drawLandmark(drawingUtils, landmark, $referencePoseColor);

          // update poseStore
          $referencePose = landmark;
        }
        context.restore();
      });
    } else {
      // Just draw reference pose
      drawLandmark(drawingUtils, $referencePose, $referencePoseColor);
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

  const onInput = () => {
    videoRef.currentTime = parseFloat(rangeRef.value);
  };

  const onSeeked = () => {
    const context = displayCanvasRef.getContext('2d');
    if (!context) return;

    const canvasWidth = displayCanvasRef.offsetWidth;
    const canvasHeight = displayCanvasRef.offsetHeight;
    displayCanvasRef.width = canvasWidth;
    displayCanvasRef.height = canvasHeight;

    drawFrame(context, canvasWidth, canvasHeight);
  };

  const onPlay = () => {
    const context = displayCanvasRef.getContext('2d');
    if (!context) return;

    const canvasWidth = displayCanvasRef.offsetWidth;
    const canvasHeight = displayCanvasRef.offsetHeight;
    displayCanvasRef.width = canvasWidth;
    displayCanvasRef.height = canvasHeight;

    const start = performance.now();

    function step(count: number) {
      if (!isPlaying || videoRef.ended || !context) {
        console.log(`frames: ${count}`);
        console.log(`time: ${performance.now() - start}ms`);
        console.log(`fps: ${count / ((performance.now() - start) / 1000)}`);
        return;
      }

      drawFrame(context, canvasWidth, canvasHeight);

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
    <canvas class="frame-canvas" bind:this={frameCanvasRef} />
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

  .frame-canvas {
    position: absolute;
    z-index: 1;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 100%;
    height: 100%;
    background-color: black;
  }

  .display-canvas {
    position: absolute;
    z-index: 2;
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
