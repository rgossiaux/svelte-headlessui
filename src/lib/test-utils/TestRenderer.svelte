<script lang="ts" context="module">
  type HandlerType = (event?: CustomEvent) => any;
  interface ComponentProps {
    onChange?: HandlerType;
  }
  type SingleComponent = [SvelteComponent, ComponentProps, TestRendererProps];
  export type TestRendererProps =
    | undefined
    | string
    | SingleComponent
    | SingleComponent[];
</script>

<script lang="ts">
  import type { SvelteComponent } from "svelte";

  function isSingleComponent(
    props: SingleComponent | SingleComponent[]
  ): props is SingleComponent {
    return Array.isArray(props) && !Array.isArray(props[0]);
  }
  export let allProps: TestRendererProps;
  let onChange: HandlerType = () => {};
  if (allProps && typeof allProps !== "string" && isSingleComponent(allProps)) {
    if (allProps[1].onChange) {
      onChange = allProps[1].onChange;
    }
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
    <svelte:component this={allProps[0]} {...allProps[1]} on:change={onChange}>
      <svelte:self allProps={allProps[2]} />
    </svelte:component>
  {/if}
{/if}
