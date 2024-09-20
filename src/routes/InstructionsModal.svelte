<script lang="ts">
  import CloseIcon from '$lib/icons/CloseIcon.svelte';
  import VideoUploadScreenshot from '$lib/assets/screenshots/video-upload.png';
  import SelectBoundaryScreenshot from '$lib/assets/screenshots/select-boundary.png';
  import VideoViewerScreenshot from '$lib/assets/screenshots/video-viewer.png';

  export let onClose: () => void;

  let detailsOpen = {
    videoUpload: true,
    selectBoundary: true,
    videoViewer: true
  };
</script>

<div class="modal">
  <button class="close-icon" on:click={onClose}>
    <CloseIcon width="24px" />
  </button>
  <div class="content">
    <h1>Welcome to AlphaBeta!</h1>
    <p>
      Elevate your climbing game with AlphaBeta - the ultimate tool for comparing Moonboard beta
      videos with precision. AlphaBeta is a cutting-edge web application that aligns two Moonboard
      beta videos and overlays body positioning data, allowing you to compare your beta against
      others' down to the inch.
    </p>

    <h2>How It Works</h2>
    <h4>Step 1: Upload Videos</h4>
    <p>
      Upload your own beta video and a comparison beta video. Or, use beta videos from Instagram by
      providing the post URL.
      <details bind:open={detailsOpen.videoUpload}>
        <summary>{detailsOpen.videoUpload ? 'Hide' : 'Show'} screenshot</summary>
        <img alt="Screenshot of video upload page" src={VideoUploadScreenshot} />
      </details>
    </p>

    <h4>Step 2: Align Moonboards</h4>
    <p>
      Select the boundaries of the Moonboards in both videos. This step ensures perfect alignment of
      the two Moonboards for accurate comparison.
      <details bind:open={detailsOpen.selectBoundary}>
        <summary>{detailsOpen.selectBoundary ? 'Hide' : 'Show'} screenshot</summary>
        <img alt="Screenshot of boundary selection page" src={SelectBoundaryScreenshot} />
      </details>
    </p>

    <h4>Step 3: Compare and Analyze</h4>
    <p>
      View the videos side-by-side with pose detection overlay. Scrub through the videos to compare
      your beta at different stages of the climb.
      <details bind:open={detailsOpen.videoViewer}>
        <summary>{detailsOpen.videoViewer ? 'Hide' : 'Show'} screenshot</summary>
        <img alt="Screenshot of video viewer page" src={VideoViewerScreenshot} />
      </details>
    </p>

    <h2>Key Features</h2>
    <ul>
      <li>Precise video alignment</li>
      <li>Advanced pose detection</li>
      <li>Side-by-side comparison</li>
      <li>Instagram integration</li>
      <li>User-friendly interface</li>
    </ul>

    <h2>Start Improving Your Technique</h2>
    <p>
      Ready to take your climbing to the next level? Start using AlphaBeta today and unlock insights
      that will help you send your projects!
    </p>

    <h3>Happy sending! 🧗‍♂️🧗‍♀️</h3>

    <hr />

    <p>
      Check out our
      <a href="https://github.com/alanzhu39/alpha-beta" target="_blank" rel="noopener noreferrer">
        GitHub
      </a> for more information and updates.
    </p>

    <p><strong>Disclaimer:</strong> AlphaBeta is not affiliated with Moonboard in any way.</p>
  </div>
</div>
<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div class="underlay" on:click={onClose}></div>

<style>
  h1 {
    margin-top: 0;
    width: fit-content;
    border-bottom: 3px solid var(--background-color-yellow);
  }

  h2 {
    width: fit-content;
    border-bottom: 3px solid var(--background-color-yellow);
  }

  h4 {
    margin-bottom: 0;
    width: fit-content;
    border-bottom: 2px solid var(--background-color-pink);
  }

  p {
    line-height: 1.3;
  }

  a {
    color: var(--text-color-white);
    text-decoration-color: var(--background-color-pink);
    text-decoration-thickness: 2px;
  }

  details {
    margin-top: 0.5rem;
    padding-right: 20px;
  }

  summary {
    cursor: pointer;
  }

  img {
    box-sizing: border-box;
    width: 100%;
    margin-top: 10px;
    border: 1px solid var(--text-color-white);
  }

  .modal {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 60%;
    height: 60%;
    background-color: var(--background-color-gray);
    z-index: 101;
    padding: 40px 40px 40px 0;
    border-radius: 40px;
  }

  .close-icon {
    position: absolute;
    top: 13px;
    right: 20px;
    background: none;
    padding: 0;
    border: none;
    cursor: pointer;
    color: var(--text-color-white);
  }

  .content {
    box-sizing: border-box;
    width: 100%;
    height: 100%;
    overflow: auto;
    padding: 0 0 0 40px;
  }

  .underlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 100;
    display: flex;
    align-items: center;
    justify-content: center;
  }
</style>
