<script lang="ts">
  import "../app.css";

  let { data, children } = $props();
</script>

<header>
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

{@render children()}
