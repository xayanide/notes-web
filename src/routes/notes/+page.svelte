<script>
  export let data;
</script>

<h1>Your Notes</h1>

<form method="post">
  <input name="title" placeholder="Title" required />
  <textarea name="content" placeholder="Content"></textarea>
  <button type="submit">Add Note</button>
</form>

<ul>
{#each data.notes as note}
  <li>
    <form method="post">
      <input type="hidden" name="id" value={note.id} />
      <input name="title" value={note.title} />
      <textarea name="content">{note.content}</textarea>
      <button name="action" value="update">Update</button>
      <button name="action" value="delete">Delete</button>
    </form>
  </li>
{/each}
</ul>

{#if data.error}
<p style="color:red">{data.error}</p>
{/if}
