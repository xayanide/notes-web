<script>
  export let form;
</script>

<h1>Sign-in</h1>

<svelte:head>
  <title>Sign-in</title>
</svelte:head>

<form method="post">
  <label>Email or Username</label>
  <input name="identifier" required />

  <label>Password</label>
  <input name="password" type="password" required />

  <button type="submit">Sign In</button>
</form>

{#if form?.error}
  <p style="color:red">{form.error}</p>
{/if}
