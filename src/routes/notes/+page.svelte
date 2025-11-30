<script>
  export let data;
</script>

<svelte:head>
  <title>Notes</title>
</svelte:head>

{#if !data.error}
  <h1>Your Notes</h1>
  <section>
    <h2>Add a New Note</h2>
    <form method="post">
      <div>
        <label for="new-title">Title</label><br />
        <input id="new-title" name="title" placeholder="Enter title" required />
      </div>
      <div>
        <label for="new-content">Content</label><br />
        <textarea id="new-content" name="content" placeholder="Enter note content"></textarea>
      </div>
      <div>
        <button type="submit">Add Note</button>
      </div>
    </form>
  </section>

  <section>
    <h2>Your Existing Notes</h2>
    <ul>
      {#each data.notes as note}
        <li style="margin-bottom:1rem; border:1px solid #ccc; padding:0.5rem;">
          <strong>Note ID:</strong>
          {note.id}<br />
          <strong>Created at:</strong>
          {note.createdAt}<br />
          <strong>Updated at:</strong>
          {note.updatedAt}<br />
          <form method="post">
            <input type="hidden" name="id" value={note.id} />
            <div>
              <label for="title-{note.id}">Title</label><br />
              <input id="title-{note.id}" name="title" value={note.title} />
            </div>
            <div>
              <label for="content-{note.id}">Content</label><br />
              <textarea id="content-{note.id}" name="content">{note.content}</textarea>
            </div>
            <div>
              <button name="action" value="update">Update</button>
              <button name="action" value="delete" type="submit">Delete</button>
            </div>
          </form>
        </li>
      {/each}
    </ul>
  </section>
{:else}
  <p style="color:red">{data.error}</p>
{/if}
