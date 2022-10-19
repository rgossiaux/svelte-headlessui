<script lang="ts">
  import { getWhyframeSource } from "@whyframe/core/utils";

  let _class = "";
  export { _class as class };

  let iframeEl: HTMLIFrameElement;
  let source: string | undefined = "";

  function getSourceCode(iframe: HTMLIFrameElement) {
    console.log(iframe);

    if (iframe) {
      source = getWhyframeSource(iframe);
    }
  }

  $: getSourceCode(iframeEl);
</script>

<iframe
  bind:this={iframeEl}
  data-why
  data-why-source
  title="Hello"
  class={_class}
>
  <slot />
</iframe>

<p>Source:</p>
<pre>{source}</pre>
