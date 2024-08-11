<script lang="ts">
  import { env } from '$env/dynamic/public';

  export let nextStep;
  export let videoSrc: string;
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
    const res = await fetch(`${env.PUBLIC_API_URL}/api/${shortcode}`);
    console.log(res);
  };
</script>

<div class="container">
  <label class="video-label">
    Upload
    <input type="file" class="video-input" on:change={onUpload} />
  </label>
  or
  <div>
    <input placeholder="Instagram post URL" bind:value={postUrlInput} />
    <button on:click={onSubmitUrl}>Submit</button>
  </div>
</div>

<style>
  .container {
    display: flex;
    flex-direction: column;
    gap: 15px;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
  }

  .video-label {
    cursor: pointer;
    background-color: var(--green);
    padding: 15px;
    border-radius: 100px;
    box-shadow: rgba(0, 0, 0, 0.24) 0px 3px 8px;
  }

  .video-input {
    width: 0;
    height: 0;
  }
</style>
