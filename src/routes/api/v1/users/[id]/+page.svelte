<script lang="ts">
  export let data;

  let name = data.target.name;
  let username = data.target.username;
  let email = data.target.email;
  let password = "";
  let role = data.target.role;
  let message = "";
  let isSaving = false;

  async function save() {
    isSaving = true;
    const res = await fetch(`/api/v1/users/${data.target.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password, role }),
    });
    isSaving = false;
    if (res.ok) {
      message = "Saved!";
    } else {
      message = "Error: " + (await res.text());
    }
  }
</script>

<h1>Edit user '{data.target.username}'</h1>

<form on:submit|preventDefault={save}>
  <label>Name</label>
  <input bind:value={name} />

  <label>Username</label>
  <input bind:value={username} />

  <label>Email</label>
  <input bind:value={email} />

  <label>New password (optional)</label>
  <input type="password" bind:value={password} />

  {#if !data.isSelf}
    <label>Role</label>
    <select bind:value={role}>
      <option value="ADMIN">ADMIN</option>
      <option value="REGULAR">REGULAR</option>
    </select>
  {:else}
    <p>You cannot change your own role.</p>
  {/if}
  <button disabled={isSaving}>Save changes</button>
</form>

<p>{message}</p>
