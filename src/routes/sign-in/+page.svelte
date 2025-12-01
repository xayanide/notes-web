<script>
  export let form;
</script>

<svelte:head>
  <title>Sign-in</title>
</svelte:head>

<h1>Sign-in</h1>

<form method="post">
  <label>Email or Username</label>
  <input name="identifier" required />
  <label>Password</label>
  <input name="password" type="password" required />
  <button type="submit">Sign in</button>
</form>

Already have an account?<a href="/sign-in">Sign in</a>

{#if form?.error}
  <p style="color:red">{form.error}</p>
{/if}
