<script lang="ts">
  export let height: number;
  let grabbing: boolean = false;
</script>

<svelte:window
  on:mousemove={(event) => {
    if (!grabbing) return;
    const { clientHeight } = document.body;
    const mouseY = clientHeight - event.pageY;
    height = Math.min(Math.max(mouseY, 20), clientHeight - 20);
  }}
  on:mouseup={() => {
    grabbing = false;
  }}
/>

<div class="draggable" on:mousedown|preventDefault={() => (grabbing = true)} />

<style lang="postcss">
  .draggable {
    background-color: #212121;
    cursor: ns-resize;
    height: 3px;
  }
</style>
