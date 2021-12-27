<script lang="ts">
  import {navigating} from '$app/stores';
  import NProgress from 'nprogress';

  $: if ($navigating) {
    NProgress.start();
  } else {
    NProgress.done();
  }

  import "../app.css";
</script>

<template>
  <slot />
</template>
