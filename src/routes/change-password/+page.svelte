<script>
  export let data;
  export let form;

  let oldPassword = "";
  let newPassword = "";
  let confirmPassword = "";
  let clientError = "";

  function onFormSubmit(event) {
    clientError = "";
    if (newPassword !== confirmPassword) {
      clientError = "New password and confirm password do not match.";
      event.preventDefault();
    }
  }
</script>

<svelte:head>
  <title>Change your password</title>
</svelte:head>

{#if data.user}
  <h1>Change your password</h1>
  <form method="post" on:submit={onFormSubmit}>
    <div>
      <label for="oldpass">Current password</label><br />
      <input id="oldpass" type="password" name="oldPassword" bind:value={oldPassword} required />
    </div>
    <div>
      <label for="newpass">New password</label><br />
      <input id="newpass" type="password" name="newPassword" bind:value={newPassword} required />
    </div>
    <div>
      <label for="confirmpass">Confirm new password</label><br />
      <input
        id="confirmpass"
        type="password"
        name="confirmPassword"
        bind:value={confirmPassword}
        required
      />
    </div>
    <button type="submit">Change password</button>
  </form>
  {#if clientError}<p style="color:red">{clientError}</p>{/if}
  {#if form?.success}<p style="color:green">{form.success}</p>{/if}
  {#if form?.error}<p style="color:red">{form.error}</p>{/if}
{:else}
  <p>You are not signed in.</p>
{/if}
