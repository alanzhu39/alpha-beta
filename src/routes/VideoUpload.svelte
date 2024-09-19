<script lang="ts">
  export let nextStep;
  export let videoSrc: string;
  export let uploadButtonText: string = 'Upload a video';

  let isLoading = false;
  let postUrlInput = '';

  const onUpload = (e: Event) => {
    const target = e.target as HTMLInputElement;
    if (target.files) videoSrc = URL.createObjectURL(target.files[0]);
    nextStep();
  };

  const onSubmitUrl = async () => {
    // process postUrlInput to extract post shortcode
    const { pathname } = new URL(postUrlInput);
    const pathnameSegments = pathname.split('/').filter((segment) => segment.length > 0);
    const shortcode = pathnameSegments[pathnameSegments.length - 1];
    try {
      isLoading = true;
      const res = await fetch(`/api/instagram?shortcode=${shortcode}`);
      isLoading = false;
      videoSrc = await res.text();
      nextStep();
    } catch (err) {
      // TODO: handle error
      console.error(err);
    }
  };
</script>

<div class="container">
  <!-- TODO: button loading and error states -->
  <label class="video-label">
    {uploadButtonText}
    <input type="file" class="video-input" on:change={onUpload} />
  </label>
  or
  <div class="url">
    <label class="url-label">
      Enter an Instagram post URL
      <input class="url-input" placeholder="Instagram post URL" bind:value={postUrlInput} />
    </label>
    <button class="submit-button" on:click={onSubmitUrl}>Submit</button>
  </div>
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
    }

    .submit-button {
      @extend %button;

      border: none;
      font-size: 16px;
      background-color: var(--background-color-pink);
      color: var(--text-color-black);
    }
  }
</style>
