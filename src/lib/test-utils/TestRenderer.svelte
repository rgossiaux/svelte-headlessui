<script lang="ts" context="module">
  type HandlerType = (event?: CustomEvent) => any;
  interface ComponentProps {
    onChange?: HandlerType;
    onClose?: HandlerType;
    onFocus?: HandlerType;
  }
  type SingleComponent = [SvelteComponent, ComponentProps, TestRendererProps];
  export type TestRendererProps =
    | undefined
    | string
    | SingleComponent
    | SingleComponent[];

  function isSingleComponent(
    props: SingleComponent | SingleComponent[]
  ): props is SingleComponent {
    return Array.isArray(props) && !Array.isArray(props[0]);
  }
</script>

<script lang="ts">
  import type { SvelteComponent } from "svelte";

  export let allProps: TestRendererProps;

  let spreadProps = {};
  let onChange: HandlerType = () => {};
  let onClose: HandlerType = () => {};
  let onFocus: HandlerType = () => {};
  if (allProps && typeof allProps !== "string" && isSingleComponent(allProps)) {
    ({
      onChange = onChange,
      onClose = onClose,
      onFocus = onFocus,
      ...spreadProps
    } = allProps[1] || {});
  }
</script>

{#if typeof allProps === "string"}
  {allProps}
{:else if Array.isArray(allProps)}
  {#if Array.isArray(allProps[0])}
    {#each allProps as childProps}
      <svelte:self allProps={childProps} />
    {/each}
  {:else}
    <svelte:component
      this={allProps[0]}
      {...spreadProps}
      on:change={onChange}
      on:close={onClose}
      on:focus={onFocus}
    >
      <svelte:self allProps={allProps[2]} />
    </svelte:component>
  {/if}
{/if}
