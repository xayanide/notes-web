<script>
  export let data;
  export let form;
</script>

<h1>Change your password</h1>

{#if data.user}
<form method="post">
  <div>
    <label for="oldpass">Current password</label><br>
    <input id="oldpass" type="password" name="oldPassword" required>
  </div>

  <div>
    <label for="newpass">New password</label><br>
    <input id="newpass" type="password" name="newPassword" required>
  </div>

  <button type="submit">Update password</button>
</form>

{#if form?.success}<p style="color:green">{form.success}</p>{/if}
{#if form?.error}<p style="color:red">{form.error}</p>{/if}

<p><a href="/sign-out">Sign-out</a></p>

{:else}
<p>You are not signed in.</p>
<a href="/sign-in">Sign-in</a>
<a href="/sign-up">Sign-up</a>
{/if}
