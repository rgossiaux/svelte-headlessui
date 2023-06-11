<script lang="ts" context="module">
  type HandlerType = (event?: CustomEvent) => any;
  interface ComponentProps {
    onClose?: HandlerType;
    onFocus?: HandlerType;
    onKeydown?: HandlerType;
    onSubmit?: HandlerType;
    onClick?: HandlerType;
  }
  type SingleComponent =
    | string
    | [typeof SvelteComponent, ComponentProps, TestRendererProps];
  export type TestRendererProps =
    | undefined
    | SingleComponent
    | SingleComponent[];

  function isSingleComponent(
    props: SingleComponent | SingleComponent[]
  ): props is SingleComponent {
    return (
      typeof props === "string" ||
      (Array.isArray(props) &&
        !Array.isArray(props[0]) &&
        typeof props[0] !== "string")
    );
  }
</script>

<script lang="ts">
  import type { SvelteComponent } from "svelte";

  export let allProps: TestRendererProps;

  let spreadProps = {};
  let onClose: HandlerType = () => {};
  let onFocus: HandlerType = () => {};
  let onKeydown: HandlerType = () => {};
  let onSubmit: HandlerType = () => {};
  let onClick: HandlerType = () => {};
  if (allProps && typeof allProps !== "string" && isSingleComponent(allProps)) {
    ({
      onClose = onClose,
      onFocus = onFocus,
      onKeydown = onKeydown,
      onSubmit = onSubmit,
      onClick = onClick,
      ...spreadProps
    } = allProps[1] || {});
  }
</script>

{#if allProps}
  {#if isSingleComponent(allProps)}
    {#if typeof allProps === "string"}
      {allProps}
    {:else}
      <svelte:component
        this={allProps[0]}
        {...spreadProps}
        on:close={onClose}
        on:focus={onFocus}
        on:keydown={onKeydown}
        on:submit={onSubmit}
        on:click={onClick}
      >
        <svelte:self allProps={allProps[2]} />
      </svelte:component>
    {/if}
  {:else}
    {#each allProps as childProps}
      <svelte:self allProps={childProps} />
    {/each}
  {/if}
{/if}
