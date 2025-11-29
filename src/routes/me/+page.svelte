<script>
  export let data;
</script>

<h1>Your me page</h1>

{#if data.user}
<p>User ID: {data.user.id}</p>
<p>Username: {data.user.username}</p>
<p>Email: {data.user.email}</p>
<p><a href="/change-password">Change password</a></p>
<p><a href="/sign-out">Sign-out</a></p>
<a href="/notes">Notes</a>
{:else}
<p>You are not signed in.</p>
<a href="/sign-in">Sign-in</a>
<a href="/sign-up">Sign-up</a>
{/if}
