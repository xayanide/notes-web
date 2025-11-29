<script>
  export let data;
</script>

<h1>Change your password</h1>
{#if data.user}
<form method="post" action="/api/v1/auth/change-password">
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
<p><a href="/sign-out">Sign-out</a></p>
{:else}
<p>You are not signed in.</p>
<a href="/sign-in">Sign-in</a>
<a href="/sign-up">Sign-up</a>
{/if}
