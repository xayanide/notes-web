<script>
  export let form;
</script>

<svelte:head>
  <title>Sign-up</title>
</svelte:head>

<h1>Sign-up</h1>

<form method="post">
  <label>Username</label>
  <input name="username" required />
  <label>Email</label>
  <input name="email" type="email" required />
  <label>Password</label>
  <input name="password" type="password" required minlength="8" />
  <button type="submit">Sign up</button>
</form>

{#if form?.error}
  <p style="color:red">{form.error}</p>
{/if}
