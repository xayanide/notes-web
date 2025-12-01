<script>
  export let data;
</script>

<svelte:head>
  <title>User{data.user ? ` - ${data.user.username}` : ""}</title>
</svelte:head>

{#if data.user}
  <h1>User profile</h1>
  <p>ID: {data.user.id}</p>
  <p>Username: {data.user.username}</p>
  <p>Role: {data.user.role}</p>
  <p>Created at: {data.user.createdAt}</p>
{:else}
  <p>User not found.</p>
{/if}
