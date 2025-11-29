<script>
  export let data;
</script>

<h1>Your Profile</h1>

{#if data.user}
<p>ID: {data.user.id}</p>
<p>Username: {data.user.username}</p>
<p>Email: {data.user.email}</p>
<p><a href="/sign-out">Sign-out</a></p>
{:else}
<p>You are not signed in.</p>
<a href="/sign-in">Sign-in</a>
{/if}
