<script>
  export let form;
</script>

<h1>Login</h1>

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
