import { redirect, type ServerLoad } from "@sveltejs/kit";

export const load: ServerLoad = async (event) => {
  const raw = event.params.id;
  const id = Number(raw);
  let res = !isNaN(id) ? await event.fetch(`/api/v1/users/${id}`) : null;
  let user = res && res.ok ? await res.json() : null;
  if (!user) {
    res = await event.fetch(`/api/v1/users/${raw}`);
    if (res.ok) {
      user = await res.json();
      throw redirect(302, `/users/${user.id}`);
    }
  }
  return { user };
};
