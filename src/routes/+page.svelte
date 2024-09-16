<script>
  import { onMount } from 'svelte';
  import ReferenceBetaFlow from './ReferenceBetaFlow.svelte';
  import UserBetaFlow from './UserBetaFlow.svelte';
  import { isMobile } from './stores';
  import { mobileCheck } from '../lib/utils';

  onMount(() => {
    $isMobile = mobileCheck();
  });
</script>

<div class="layout">
  <UserBetaFlow />
  <ReferenceBetaFlow />
  <!-- TODO: some kind of cool logo -->
  <h1 class="header">AlphaBeta</h1>
  <!-- TODO: info icon -->
  <!-- TODO: settings icon -->
  <!-- TODO: modal with instructions when you first enter the app -->
</div>

<style>
  :global(body) {
    /* Moonboard app theme colors */
    --background-color-dark-gray: #1f1f20;
    --background-color-gray: #343434;
    --background-color-yellow: #fdb91f;

    --text-color-white: #e6e6e6;
    --text-color-black: #000;

    font-family: 'Inter', sans-serif;

    margin: 0;
    padding: 0;
  }

  .layout {
    width: 100dvw;
    height: 100dvh;

    display: grid;
    grid-template:
      'left right' minmax(0, 1fr)
      'header header' auto
      / 1fr 1fr;

    background-color: var(--background-color-dark-gray);
    color: var(--text-color-white);
  }

  .header {
    grid-area: header;
    /* Adding a little space at the bottom for iPad gesture controls */
    margin: 0;
    padding: 13px 0;
    background-color: var(--background-color-gray);
  }
</style>
