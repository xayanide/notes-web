<script lang="ts">
  import "./layout.css";
  import favicon from "$lib/assets/favicon.svg";
  export let data;
</script>

<svelte:head>
  <link rel="icon" href={favicon} />
</svelte:head>

<header>
  {data.user ? `Hello, ${data.user.name}` : "Hello"}
  <nav>
    <a href="/">Home</a>
    {#if data.user}
      <a href="/me">Me</a>
      <a href="/notes">Notes</a>
      <a href="/sign-out">Sign out</a>
    {:else}
      <a href="/sign-in">Sign in</a>
      <a href="/sign-up">Sign up</a>
    {/if}
  </nav>
</header>

<main>
  <slot />
</main>
