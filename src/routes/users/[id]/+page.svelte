<script>
  export let data;
</script>

<h1>User Profile</h1>

{#if data.user}
<p>ID: {data.user.id}</p>
<p>Username: {data.user.username}</p>
{:else}
<p>User not found.</p>
{/if}
