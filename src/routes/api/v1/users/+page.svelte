<script lang="ts">
  export let data;
</script>

<svelte:head>
  <title>Admin - User Management</title>
</svelte:head>

<h1>User Management</h1>

<table>
  <thead>
    <tr>
      <th>ID</th><th>Name</th><th>Username</th><th>Email</th><th>Role</th><th></th>
    </tr>
  </thead>
  <tbody>
    {#each data.users as u}
      <tr>
        <td>{u.id}</td><td>{u.name ?? "N/A"}</td><td>{u.username}</td><td>{u.email}</td><td
          >{u.role}</td
        >
        <td><a href={`/users/${u.id}`}>Edit</a></td>
      </tr>
    {/each}
  </tbody>
</table>
