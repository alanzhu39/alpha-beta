<script lang="ts">
  import SelectBoundary from './SelectBoundary.svelte';
  import VideoUpload from './VideoUpload.svelte';
  import VideoViewer from './VideoViewer.svelte';
  import { referencePerspective, type Coordinate } from './stores';

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
    $referencePerspective = [corners[0], corners[1], corners[2], corners[3]];
  };

  const onBoundaryBack = () => {
    currentStep = STEPS.VIDEO_UPLOAD;
  };

  const onViewerBack = () => {
    currentStep = STEPS.SELECT_BOUNDARY;
    corners = [];
  };
</script>

<div class="container">
  {#if currentStep === STEPS.VIDEO_UPLOAD}
    <VideoUpload
      bind:videoSrc
      nextStep={onVideoUpload}
      uploadButtonText="Upload comparison video"
    />
  {/if}
  {#if currentStep === STEPS.SELECT_BOUNDARY}
    <SelectBoundary
      {videoSrc}
      bind:corners
      backStep={onBoundaryBack}
      nextStep={onSelectedBoundary}
    />
  {/if}
  {#if currentStep === STEPS.DISPLAY}
    <VideoViewer {videoSrc} backStep={onViewerBack} isReference={true} />
  {/if}
</div>

<style>
  .container {
    border-left: 2px solid var(--background-color-gray);
  }
</style>
