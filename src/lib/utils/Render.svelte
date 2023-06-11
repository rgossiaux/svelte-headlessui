<script lang="ts" context="module">
  import { isValidElement, type SupportedAs } from "$lib/internal/elements";
  import { get_current_component } from "svelte/internal";

  export enum RenderStrategy {
    Unmount,
    Hidden,
  }
</script>

<script lang="ts">
  import { useActions, type HTMLActionArray } from "$lib/hooks/use-actions";
  import { forwardEventsBuilder } from "$lib/internal/forwardEventsBuilder";
  import { Features, type TRenderProps } from "$lib/types";
  const forwardEvents = forwardEventsBuilder(get_current_component());

  type TSlotProps = $$Generic<{}>;
  type TAsProp = $$Generic<SupportedAs>;
  type $$Props = TRenderProps<TSlotProps, TAsProp, TAsProp>;

  export let name: string;
  export let as: TAsProp;
  export let slotProps: TSlotProps;
  // A workaround for passing name="" to the element since name is already used
  // Will not be need when <Render> is replaced with <svelte:element>
  export let elementName:string | null = null;

  export let el: HTMLElement | null = null;
  export let use: HTMLActionArray = [];
  export let visible = true;
  export let features: Features = Features.None;
  // The static and unmount props are only used in conjunction with the render strategies
  export let unmount = true;
  let static_ = false;
  export { static_ as static };

  let classProp: ((props: TSlotProps) => string) | string | undefined =
    undefined;
  export { classProp as class };

  // This is not in upstream Headless UI, but we might as well add it here
  export let style: ((props: TSlotProps) => string) | string | undefined =
    undefined;

  if (!as) {
    throw new Error(`<${name}> did not provide an \`as\` value to <Render>`);
  }

  if (!isValidElement(as)) {
    throw new Error(
      `<${name}> has an invalid or unsupported \`as\` prop: ${as}`
    );
  }

  $: computedClass =
    typeof classProp === "function" ? classProp(slotProps) : classProp;
  $: computedStyle = typeof style === "function" ? style(slotProps) : style;

  $: show =
    visible ||
    (features & Features.Static && static_) ||
    !(features & Features.RenderStrategy && unmount);
  $: hidden =
    !visible &&
    !(features & Features.Static && static_) &&
    features & Features.RenderStrategy &&
    !unmount;

  $: propsWeControl = {
    name:elementName || undefined,
    class: computedClass,
    style:
      `${computedStyle ?? ""}${hidden ? " display: none" : ""}` || undefined,
  };
  $: if (propsWeControl.style === undefined) {
    delete propsWeControl.style;
  }
  $: if (propsWeControl.name === undefined) {
    delete propsWeControl.name;
  }
</script>

{#if show}
  <!-- Here be dragons.
       This horrible monstrosity is nonetheless much more efficient than
        wrapping each element in its own component; that adds too much
        overhead to bundle size from each component.
       When <svelte:element> is merged in, this nightmare will be fixed. -->
  {#if as === "a"}
    <!-- svelte-ignore a11y-missing-attribute -->
    <a
      bind:this={el}
      use:useActions={use}
      use:forwardEvents
      {...$$restProps}
      {...propsWeControl}
      hidden={hidden || undefined}
    >
      <slot />
    </a>
  {:else if as === "address"}
    <address
      bind:this={el}
      use:useActions={use}
      use:forwardEvents
      {...$$restProps}
      {...propsWeControl}
      hidden={hidden || undefined}
    >
      <slot />
    </address>
  {:else if as === "article"}
    <article
      bind:this={el}
      use:useActions={use}
      use:forwardEvents
      {...$$restProps}
      {...propsWeControl}
      hidden={hidden || undefined}
    >
      <slot />
    </article>
  {:else if as === "aside"}
    <aside
      bind:this={el}
      use:useActions={use}
      use:forwardEvents
      {...$$restProps}
      {...propsWeControl}
      hidden={hidden || undefined}
    >
      <slot />
    </aside>
  {:else if as === "b"}
    <b
      bind:this={el}
      use:useActions={use}
      use:forwardEvents
      {...$$restProps}
      {...propsWeControl}
      hidden={hidden || undefined}
    >
      <slot />
    </b>
  {:else if as === "bdi"}
    <bdi
      bind:this={el}
      use:useActions={use}
      use:forwardEvents
      {...$$restProps}
      {...propsWeControl}
      hidden={hidden || undefined}
    >
      <slot />
    </bdi>
  {:else if as === "bdo"}
    <bdo
      bind:this={el}
      use:useActions={use}
      use:forwardEvents
      {...$$restProps}
      {...propsWeControl}
      hidden={hidden || undefined}
    >
      <slot />
    </bdo>
  {:else if as === "blockquote"}
    <blockquote
      bind:this={el}
      use:useActions={use}
      use:forwardEvents
      {...$$restProps}
      {...propsWeControl}
      hidden={hidden || undefined}
    >
      <slot />
    </blockquote>
  {:else if as === "button"}
    <button
      bind:this={el}
      use:useActions={use}
      use:forwardEvents
      {...$$restProps}
      {...propsWeControl}
      hidden={hidden || undefined}
    >
      <slot />
    </button>
  {:else if as === "cite"}
    <cite
      bind:this={el}
      use:useActions={use}
      use:forwardEvents
      {...$$restProps}
      {...propsWeControl}
      hidden={hidden || undefined}
    >
      <slot />
    </cite>
  {:else if as === "code"}
    <code
      bind:this={el}
      use:useActions={use}
      use:forwardEvents
      {...$$restProps}
      {...propsWeControl}
      hidden={hidden || undefined}
    >
      <slot />
    </code>
  {:else if as === "data"}
    <data
      bind:this={el}
      use:useActions={use}
      use:forwardEvents
      {...$$restProps}
      {...propsWeControl}
      hidden={hidden || undefined}
    >
      <slot />
    </data>
  {:else if as === "datalist"}
    <datalist
      bind:this={el}
      use:useActions={use}
      use:forwardEvents
      {...$$restProps}
      {...propsWeControl}
      hidden={hidden || undefined}
    >
      <slot />
    </datalist>
  {:else if as === "dd"}
    <dd
      bind:this={el}
      use:useActions={use}
      use:forwardEvents
      {...$$restProps}
      {...propsWeControl}
      hidden={hidden || undefined}
    >
      <slot />
    </dd>
  {:else if as === "dl"}
    <dl
      bind:this={el}
      use:useActions={use}
      use:forwardEvents
      {...$$restProps}
      {...propsWeControl}
      hidden={hidden || undefined}
    >
      <slot />
    </dl>
  {:else if as === "dt"}
    <dt
      bind:this={el}
      use:useActions={use}
      use:forwardEvents
      {...$$restProps}
      {...propsWeControl}
      hidden={hidden || undefined}
    >
      <slot />
    </dt>
  {:else if as === "div"}
    <div
      bind:this={el}
      use:useActions={use}
      use:forwardEvents
      {...$$restProps}
      {...propsWeControl}
      hidden={hidden || undefined}
    >
      <slot />
    </div>
  {:else if as === "em"}
    <em
      bind:this={el}
      use:useActions={use}
      use:forwardEvents
      {...$$restProps}
      {...propsWeControl}
      hidden={hidden || undefined}
    >
      <slot />
    </em>
  {:else if as === "footer"}
    <footer
      bind:this={el}
      use:useActions={use}
      use:forwardEvents
      {...$$restProps}
      {...propsWeControl}
      hidden={hidden || undefined}
    >
      <slot />
    </footer>
  {:else if as === "form"}
    <form
      bind:this={el}
      use:useActions={use}
      use:forwardEvents
      {...$$restProps}
      {...propsWeControl}
      hidden={hidden || undefined}
    >
      <slot />
    </form>
  {:else if as === "h1"}
    <h1
      bind:this={el}
      use:useActions={use}
      use:forwardEvents
      {...$$restProps}
      {...propsWeControl}
      hidden={hidden || undefined}
    >
      <slot />
    </h1>
  {:else if as === "h2"}
    <h2
      bind:this={el}
      use:useActions={use}
      use:forwardEvents
      {...$$restProps}
      {...propsWeControl}
      hidden={hidden || undefined}
    >
      <slot />
    </h2>
  {:else if as === "h3"}
    <h3
      bind:this={el}
      use:useActions={use}
      use:forwardEvents
      {...$$restProps}
      {...propsWeControl}
      hidden={hidden || undefined}
    >
      <slot />
    </h3>
  {:else if as === "h4"}
    <h4
      bind:this={el}
      use:useActions={use}
      use:forwardEvents
      {...$$restProps}
      {...propsWeControl}
      hidden={hidden || undefined}
    >
      <slot />
    </h4>
  {:else if as === "h5"}
    <h5
      bind:this={el}
      use:useActions={use}
      use:forwardEvents
      {...$$restProps}
      {...propsWeControl}
      hidden={hidden || undefined}
    >
      <slot />
    </h5>
  {:else if as === "h6"}
    <h6
      bind:this={el}
      use:useActions={use}
      use:forwardEvents
      {...$$restProps}
      {...propsWeControl}
      hidden={hidden || undefined}
    >
      <slot />
    </h6>
  {:else if as === "header"}
    <header
      bind:this={el}
      use:useActions={use}
      use:forwardEvents
      {...$$restProps}
      {...propsWeControl}
      hidden={hidden || undefined}
    >
      <slot />
    </header>
  {:else if as === "i"}
    <i
      bind:this={el}
      use:useActions={use}
      use:forwardEvents
      {...$$restProps}
      {...propsWeControl}
      hidden={hidden || undefined}
    >
      <slot />
    </i>
  {:else if as === "input"}
    <input
      bind:this={el}
      use:useActions={use}
      use:forwardEvents
      {...$$restProps}
      {...propsWeControl}
      hidden={hidden || undefined}
    />
  {:else if as === "label"}
    <!-- svelte-ignore a11y-label-has-associated-control -->
    <label
      bind:this={el}
      use:useActions={use}
      use:forwardEvents
      {...$$restProps}
      {...propsWeControl}
      hidden={hidden || undefined}
    >
      <slot />
    </label>
  {:else if as === "li"}
    <li
      bind:this={el}
      use:useActions={use}
      use:forwardEvents
      {...$$restProps}
      {...propsWeControl}
      hidden={hidden || undefined}
    >
      <slot />
    </li>
  {:else if as === "main"}
    <main
      bind:this={el}
      use:useActions={use}
      use:forwardEvents
      {...$$restProps}
      {...propsWeControl}
      hidden={hidden || undefined}
    >
      <slot />
    </main>
  {:else if as === "nav"}
    <nav
      bind:this={el}
      use:useActions={use}
      use:forwardEvents
      {...$$restProps}
      {...propsWeControl}
      hidden={hidden || undefined}
    >
      <slot />
    </nav>
  {:else if as === "ol"}
    <ol
      bind:this={el}
      use:useActions={use}
      use:forwardEvents
      {...$$restProps}
      {...propsWeControl}
      hidden={hidden || undefined}
    >
      <slot />
    </ol>
  {:else if as === "p"}
    <p
      bind:this={el}
      use:useActions={use}
      use:forwardEvents
      {...$$restProps}
      {...propsWeControl}
      hidden={hidden || undefined}
    >
      <slot />
    </p>
  {:else if as === "section"}
    <section
      bind:this={el}
      use:useActions={use}
      use:forwardEvents
      {...$$restProps}
      {...propsWeControl}
      hidden={hidden || undefined}
    >
      <slot />
    </section>
  {:else if as === "span"}
    <span
      bind:this={el}
      use:useActions={use}
      use:forwardEvents
      {...$$restProps}
      {...propsWeControl}
      hidden={hidden || undefined}
    >
      <slot />
    </span>
  {:else if as === "strong"}
    <strong
      bind:this={el}
      use:useActions={use}
      use:forwardEvents
      {...$$restProps}
      {...propsWeControl}
      hidden={hidden || undefined}
    >
      <slot />
    </strong>
  {:else if as === "ul"}
    <ul
      bind:this={el}
      use:useActions={use}
      use:forwardEvents
      {...$$restProps}
      {...propsWeControl}
      hidden={hidden || undefined}
    >
      <slot />
    </ul>
  {:else}
    <svelte:component
      this={as}
      bind:el
      use={[...use, forwardEvents]}
      {...$$restProps}
      {...propsWeControl}
      hidden={hidden || undefined}
    >
      <slot />
    </svelte:component>
  {/if}
{/if}
