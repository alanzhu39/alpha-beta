<script lang="ts">
  import SelectBoundary from './SelectBoundary.svelte';
  import VideoScrubber from './VideoScrubber.svelte';
  import VideoUpload from './VideoUpload.svelte';
  import { userPerspective, type Coordinate } from './stores';

  const STEPS = {
    VIDEO_UPLOAD: 'videoUpload',
    SELECT_BOUNDARY: 'selectBoundary',
    DISPLAY: 'display'
  };

  let currentStep = STEPS.VIDEO_UPLOAD;
  let videoSrc = '';
  let corners: Coordinate[];

  const onVideoUpload = () => {
    currentStep = STEPS.SELECT_BOUNDARY;
  };

  const onSelectedBoundary = () => {
    currentStep = STEPS.DISPLAY;
    // add boundary corners to store
    $userPerspective = [corners[0], corners[1], corners[2], corners[3]];
  };

  const onScrubberBack = () => {
    currentStep = STEPS.SELECT_BOUNDARY;
    corners = [];
  };
</script>

<div class="container">
  {#if currentStep === STEPS.VIDEO_UPLOAD}
    <VideoUpload bind:videoSrc nextStep={onVideoUpload} />
  {/if}
  {#if currentStep === STEPS.SELECT_BOUNDARY}
    <SelectBoundary {videoSrc} bind:corners nextStep={onSelectedBoundary} />
  {/if}
  {#if currentStep === STEPS.DISPLAY}
    <VideoScrubber {videoSrc} backStep={onScrubberBack} />
  {/if}
</div>

<style>
  .container {
    border-right: 2px solid var(--background-color-gray);
  }
</style>
