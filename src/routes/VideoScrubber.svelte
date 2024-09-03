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
    isMobile,
    referencePerspective,
    referencePose,
    referencePoseColor,
    userCanvasDimensions,
    userPerspective,
    userPose,
    userPoseColor
  } from './stores';

  export let backStep;
  export let videoSrc: string;
  export let isReference: boolean = false;

  let videoRef: HTMLVideoElement;
  let videoDuration: number;
  let rangeRef: HTMLInputElement;
  let isPlaying = false;
  let fps: number = 0;

  // Canvas with the WebGL context used by mediapipe for
  // doing pose detection in GPU mode
  let detectionCanvasRef: HTMLCanvasElement;

  // Canvas for drawing the user and reference poses
  let displayCanvasRef: HTMLCanvasElement;

  // Canvas for drawing the current video frame
  // Controlled by glfx
  let frameCanvasRef: HTMLCanvasElement;

  let poseLandmarker: PoseLandmarker;
  let referenceTransform: boolean = false;
  let glfxCanvas: GlfxCanvas;
  let glfxTexture: GlfxTexture;

  const setupPoseLandmarker = async (useGpu: boolean = false) => {
    // Create pose landmarker
    const vision = await FilesetResolver.forVisionTasks('@mediapipe/tasks-vision/wasm');
    poseLandmarker = await PoseLandmarker.createFromOptions(vision, {
      baseOptions: {
        /* Disabling GPU pose detection for now on iPad since it's exploding the WebGL context */
        delegate: useGpu ? 'GPU' : 'CPU',
        modelAssetPath:
          // 'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_heavy/float16/latest/pose_landmarker_heavy.task'
          'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_full/float16/latest/pose_landmarker_full.task'
        // 'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/latest/pose_landmarker_lite.task'
      },
      canvas: useGpu ? detectionCanvasRef : undefined,
      numPoses: 1,
      runningMode: 'VIDEO'
    });

    if (useGpu) {
      detectionCanvasRef.addEventListener('webglcontextlost', () => {
        alert('Detection canvas WebGL context lost');
        setupPoseLandmarker(false);
      });
    }
  };

  const setupGlfx = () => {
    // Create glfx canvas for drawing perspective shift in reference video
    glfxCanvas = fx.canvas();
    glfxCanvas.className = frameCanvasRef.className;
    frameCanvasRef.replaceWith(glfxCanvas);
    frameCanvasRef = glfxCanvas;

    glfxTexture = glfxCanvas.texture(videoRef);

    glfxCanvas.addEventListener('webglcontextlost', () => {
      alert('Glfx canvas WebGL context lost');
      setupGlfx();
    });
  };

  onMount(async () => {
    await setupPoseLandmarker(true);

    let canvasWidth = videoRef.offsetWidth;
    let canvasHeight = videoRef.offsetHeight;

    if (isReference) {
      setupGlfx();

      if ($userCanvasDimensions) {
        [canvasWidth, canvasHeight] = $userCanvasDimensions;
      }
    } else {
      // If drawing the user video, then set the canvas dimensions store
      $userCanvasDimensions = [videoRef.offsetWidth, videoRef.offsetHeight];
    }

    // Set canvas dimensions
    setCanvasDimensions(canvasWidth, canvasHeight);

    // Mute video
    videoRef.muted = true;

    // Draw the first frame of the video
    videoRef.currentTime = 0;
  });

  $: {
    if (rangeRef && videoDuration) {
      rangeRef.max = videoDuration.toString();
    }
  }

  $: referenceTransform = !!$referencePerspective && !!$userPerspective;

  $: {
    if (
      // If this is the reference video, the video isn't playing, and the user pose is updated, redraw the landmarks
      (isReference && $userPose && !isPlaying && displayCanvasRef) ||
      // If this is the user video, the video isn't playing, and the reference pose is updated, redraw the landmarks
      (!isReference && $referencePose && !isPlaying && displayCanvasRef)
    ) {
      redrawLandmarks();
    }
  }

  // Reactive statement for setting the canvas dimensions
  $: {
    if ($userCanvasDimensions && displayCanvasRef && frameCanvasRef) {
      setCanvasDimensions(...$userCanvasDimensions);
      videoRef.currentTime = 0;
    }
  }

  const setCanvasDimensions = (canvasWidth: number, canvasHeight: number) => {
    displayCanvasRef.width = canvasWidth;
    displayCanvasRef.height = canvasHeight;
    displayCanvasRef.style.width = `${canvasWidth}px`;
    displayCanvasRef.style.height = `${canvasHeight}px`;

    frameCanvasRef.width = canvasWidth;
    frameCanvasRef.height = canvasHeight;
    frameCanvasRef.style.width = `${canvasWidth}px`;
    frameCanvasRef.style.height = `${canvasHeight}px`;
  };

  const onPlayClick = () => {
    isPlaying = true;
    videoRef.play();
  };

  const onPauseClick = () => {
    isPlaying = false;
    videoRef.pause();
  };

  const drawFrame = (
    poseContext: CanvasRenderingContext2D,
    frameWidth: number,
    frameHeight: number,
    detectPose: boolean = true
  ) => {
    if (isReference) {
      drawFrameAsReference(poseContext, frameWidth, frameHeight, detectPose);
    } else {
      drawFrameAsUser(poseContext, frameWidth, frameHeight, detectPose);
    }
  };

  const drawFrameAsUser = (
    poseContext: CanvasRenderingContext2D,
    frameWidth: number,
    frameHeight: number,
    detectPose: boolean
  ) => {
    const frameContext = frameCanvasRef.getContext('2d');
    if (!frameContext) return;

    // Draw the current frame
    frameContext.drawImage(videoRef, 0, 0, frameWidth, frameHeight);

    poseContext.clearRect(0, 0, frameWidth, frameHeight);

    // Draw overlay reference pose
    const drawingUtils = new DrawingUtils(poseContext);
    drawLandmark(drawingUtils, $referencePose, $referencePoseColor);

    // Detect pose
    if (detectPose) {
      poseLandmarker.detectForVideo(videoRef, performance.now(), (result) => {
        poseContext.save();
        for (const landmark of result.landmarks) {
          // Draw user pose
          drawLandmark(drawingUtils, landmark, $userPoseColor);

          // update poseStore
          $userPose = landmark;
        }
        poseContext.restore();
      });
    } else {
      // Just draw user pose
      drawLandmark(drawingUtils, $userPose, $userPoseColor);
    }
  };

  const drawFrameAsReference = (
    poseContext: CanvasRenderingContext2D,
    frameWidth: number,
    frameHeight: number,
    detectPose: boolean
  ) => {
    glfxTexture.loadContentsOf(videoRef);
    const frameContext: GlfxCanvas = glfxCanvas.draw(glfxTexture);

    if (referenceTransform) {
      // Draw frame with perspective shift
      const videoWidth = videoRef.videoWidth;
      const videoHeight = videoRef.videoHeight;

      // Shift reference perspective into the user perspective
      const before = $referencePerspective.flatMap(([x, y]) => [
        x * videoWidth,
        y * videoHeight
      ]) as GlfxCoordinates;
      const after = $userPerspective.flatMap(([x, y]) => [
        x * videoWidth,
        y * videoHeight
      ]) as GlfxCoordinates;

      frameContext.perspective(before, after).update();
    } else {
      // Draw frame without perspective shift
      frameContext.update();
    }

    poseContext.clearRect(0, 0, frameWidth, frameHeight);

    // Draw overlay user pose
    const drawingUtils = new DrawingUtils(poseContext);
    drawLandmark(drawingUtils, $userPose, $userPoseColor);

    // Detect pose
    if (detectPose) {
      poseLandmarker.detectForVideo(frameCanvasRef, performance.now(), (result) => {
        for (const landmark of result.landmarks) {
          // Draw reference pose
          drawLandmark(drawingUtils, landmark, $referencePoseColor);

          // update poseStore
          $referencePose = landmark;
        }
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

  const redrawLandmarks = () => {
    const context = displayCanvasRef.getContext('2d');
    if (!context) return;

    context.clearRect(0, 0, displayCanvasRef.width, displayCanvasRef.height);

    const drawingUtils = new DrawingUtils(context);
    drawLandmark(drawingUtils, $userPose, $userPoseColor);
    drawLandmark(drawingUtils, $referencePose, $referencePoseColor);
  };

  const onInput = () => {
    videoRef.currentTime = parseFloat(rangeRef.value);
  };

  const onEnded = () => {
    isPlaying = false;
  };

  const onSeeked = () => {
    const context = displayCanvasRef.getContext('2d');
    if (!context) return;

    drawFrame(context, displayCanvasRef.offsetWidth, displayCanvasRef.offsetHeight);
  };

  const onPlaying = () => {
    const context = displayCanvasRef.getContext('2d');
    if (!context) return;

    const canvasWidth = displayCanvasRef.offsetWidth;
    const canvasHeight = displayCanvasRef.offsetHeight;

    const start = performance.now();

    function step(count: number) {
      if (!isPlaying || videoRef.ended || !context) {
        console.log(`frames: ${count}`);
        console.log(`time: ${performance.now() - start}ms`);
        fps = count / ((performance.now() - start) / 1000);
        console.log(`fps: ${fps}`);
        return;
      }

      drawFrame(context, canvasWidth, canvasHeight);

      if ($isMobile) {
        // Throttling here seems to help out with video stuttering on mobile devices
        setTimeout(() => requestAnimationFrame(() => step(count + 1)), 1000 / 60);
      } else {
        requestAnimationFrame(() => step(count + 1));
      }
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
      playsinline
      crossorigin="anonymous"
      bind:this={videoRef}
      bind:duration={videoDuration}
      on:playing={onPlaying}
      on:seeked={onSeeked}
      on:timeupdate={onTimeUpdate}
      on:ended={onEnded}
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
    <!-- TODO: remove this in design updates -->
    {fps}
  </div>
</div>

<style lang="scss">
  .container {
    display: grid;
    grid-template-rows: minmax(0, 1fr) auto;
    height: 100%;
    position: relative;
  }

  .back-button {
    position: absolute;
    z-index: 10;
    cursor: pointer;
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
    visibility: hidden;
  }

  %canvas {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 100%;
    height: 100%;
  }

  .detection-canvas {
    @extend %canvas;

    z-index: -1;
  }

  .frame-canvas {
    @extend %canvas;

    z-index: 1;
    background-color: black;
  }

  .display-canvas {
    @extend %canvas;

    z-index: 2;
    background-color: transparent;
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
