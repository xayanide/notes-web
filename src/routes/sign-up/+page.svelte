<script>
  export let form;
</script>

<h1>Register</h1>

<form method="post">
  <label>Username</label>
  <input name="username" required />

  <label>Email</label>
  <input name="email" type="email" required />

  <label>Password</label>
  <input name="password" type="password" required minlength="8" />

  <button type="submit">Create Account</button>
</form>

{#if form?.error}
  <p style="color:red">{form.error}</p>
{/if}
