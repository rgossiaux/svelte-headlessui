<script lang="ts">
  export let url: string;
  export let code: string;
</script>

<div class="h-[400px] rounded-xl bg-teal-300">
  <iframe src={url} class="w-full h-full" />
</div>
<p>{code}</p>
