<script lang="ts">
  export let nextStep;
  export let videoSrc: string;
  export let uploadButtonText: string = 'Upload a video';

  let isLoading = false;
  let inputError: string | null = null;
  let postUrlInput = '';

  const onUpload = (e: Event) => {
    const target = e.target as HTMLInputElement;
    if (target.files) videoSrc = URL.createObjectURL(target.files[0]);
    nextStep();
  };

  const onInput = () => {
    inputError = null;
  };

  const onSubmitUrl = async () => {
    try {
      // process postUrlInput to extract post shortcode
      const { pathname } = new URL(postUrlInput);
      const pathnameSegments = pathname.split('/').filter((segment) => segment.length > 0);
      const shortcode = pathnameSegments[pathnameSegments.length - 1];

      isLoading = true;
      const res = await fetch(`/api/instagram?shortcode=${shortcode}`);
      isLoading = false;
      videoSrc = await res.text();
      nextStep();
    } catch (err) {
      console.error(err);
      inputError = 'Failed to fetch video. Please try again!';
    }
  };
</script>

<div class="container">
  <label class="video-label">
    {uploadButtonText}
    <input type="file" class="video-input" on:change={onUpload} />
  </label>
  or
  <form class="url">
    <label class="url-label" on:submit={onSubmitUrl}>
      Enter an Instagram post URL
      <input
        class="url-input"
        placeholder="Instagram post URL"
        bind:value={postUrlInput}
        on:input={onInput}
      />
      {#if inputError}<span class="error">{inputError}</span>{/if}
    </label>
    <button
      class={`submit-button ${isLoading ? 'loading' : ''}`}
      on:click={onSubmitUrl}
      disabled={isLoading}
    >
      Submit
    </button>
  </form>
</div>

<style lang="scss">
  .container {
    display: flex;
    flex-direction: column;
    gap: 15px;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
  }

  %button {
    background-color: var(--background-color-yellow);
    color: var(--text-color-black);
    padding: 15px;
    border-radius: 100px;
    cursor: pointer;
  }

  .video-label {
    @extend %button;
  }

  .video-input {
    display: none;
  }

  .url {
    display: flex;
    gap: 10px;
    align-items: center;

    .url-label {
      display: flex;
      flex-direction: column;
      gap: 5px;

      .url-input {
        font-size: 13px;
        padding: 5px;
        border-radius: 5px;
      }

      .error {
        color: var(--text-color-red);
        font-size: 12px;
      }
    }

    .submit-button {
      @extend %button;

      border: none;
      font-size: 16px;
      background-color: var(--background-color-pink);
      color: var(--text-color-black);
      position: relative;

      &:disabled {
        cursor: auto;
        opacity: 0.6;
        color: transparent;
      }

      &.loading::after {
        // Loading spinner
        content: '';
        position: absolute;
        width: 30px;
        height: 30px;
        box-sizing: border-box;
        animation: rotation 1s linear infinite;
        border-radius: 50%;
        border: 4px solid var(--background-color-gray);
        border-bottom-color: transparent;
        top: 50%;
        left: 50%;
        translate: -50% -50%;
      }
    }
  }

  @keyframes rotation {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
</style>
