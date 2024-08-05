<script lang="ts">
  import { onMount } from 'svelte';

  export let nextStep;
  export let videoSrc: string;

  onMount(async () => {
    const PyodideWorker = await import('$lib/pyodide.worker?worker');
    const pyodideWorker = new PyodideWorker.default();
    pyodideWorker.onmessage = (event) => {
      console.log(event.data);
    };
    pyodideWorker.postMessage('1 + 1');
  });

  const onChange = (e: Event) => {
    const target = e.target as HTMLInputElement;
    if (target.files) videoSrc = URL.createObjectURL(target.files[0]);
    nextStep();
  };
</script>

<div class="container">
  <label class="video-label">
    Upload
    <input type="file" class="video-input" on:change={onChange} />
  </label>
</div>

<style>
  .container {
    display: flex;
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
