export const load = async (event) => {
  await event.fetch("/api/v1/auth/sign-out", {
    method: "POST",
  });
};
