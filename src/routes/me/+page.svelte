<script>
  export let data;
</script>

<svelte:head>
  <title>Me{data.user ? ` - ${data.user.username}` : ""}</title>
</svelte:head>

<h1>Your me page</h1>

{#if data.user}
  <p>User ID: {data.user.id}</p>
  <p>Username: {data.user.username}</p>
  <p>Email: {data.user.email}</p>
  <p>Created at: {data.user.createdAt}</p>
  <a href="/change-password">Change Password</a>
{:else}
  <p>You are not signed in.</p>
{/if}
