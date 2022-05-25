<script lang="ts">
  export let url: string;
  export let code: string;
  let _class = "";
  export { _class as class };
</script>

<div class:rounded-xl={true} class={_class}>
  <iframe src={url} class="w-full h-full" />
</div>
<p>{code}</p>
