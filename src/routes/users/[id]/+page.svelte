<script>
  export let data;
</script>

<svelte:head>
  <title>User{data.user ? ` - ${data.user.username}` : ""}</title>
</svelte:head>

<h1>User Profile</h1>

{#if data.user}
  <p>ID: {data.user.id}</p>
  <p>Username: {data.user.username}</p>
  <p>Role: {data.user.role}</p>
  <p>Created at: {data.user.createdAt}</p>
{:else}
  <p>User not found.</p>
{/if}
