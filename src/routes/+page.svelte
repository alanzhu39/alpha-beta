<script>
  import { onMount } from 'svelte';
  import ReferenceBetaFlow from './ReferenceBetaFlow.svelte';
  import UserBetaFlow from './UserBetaFlow.svelte';
  import { isMobile } from './stores';
  import { mobileCheck } from '../lib/utils';
  import SettingsIcon from '$lib/icons/SettingsIcon.svelte';
  import InfoIcon from '$lib/icons/InfoIcon.svelte';
  import InstructionsModal from './InstructionsModal.svelte';

  let isModalOpen =
    typeof localStorage === 'undefined' ? false : localStorage.getItem('didCloseModal') !== 'true';

  onMount(() => {
    $isMobile = mobileCheck();
  });

  const onInfoClick = () => {
    isModalOpen = true;
  };

  const onModalClose = () => {
    localStorage.setItem('didCloseModal', 'true');
    isModalOpen = false;
  };
</script>

<div class="layout">
  <UserBetaFlow />
  <ReferenceBetaFlow />
  <!-- TODO: some kind of cool logo -->
  <h1 class="header">
    <span>AlphaBeta</span>
    <div class="buttons-container">
      <button class="icon-button" on:click={onInfoClick}>
        <InfoIcon height="25px" />
      </button>
      <!-- TODO: settings click -->
      <button class="icon-button">
        <SettingsIcon height="30px" />
      </button>
    </div>
  </h1>
  {#if isModalOpen}
    <InstructionsModal onClose={onModalClose} />
  {/if}
</div>

<style>
  :global(body) {
    /* Moonboard app theme colors */
    --background-color-dark-gray: #1f1f20;
    --background-color-gray: #343434;
    --background-color-yellow: #fdb91f;
    --background-color-pink: #e5a4cb;

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
    padding: 13px 10px;
    background-color: var(--background-color-gray);
    display: flex;
    justify-content: space-between;
  }

  .buttons-container {
    display: flex;
    padding: 0 10px;
    gap: 20px;
  }

  .icon-button {
    margin: 0;
    background: none;
    padding: 0;
    border: none;
    cursor: pointer;
    color: var(--text-color-white);
    display: flex;
    align-items: center;
    width: 30px;
  }
</style>
