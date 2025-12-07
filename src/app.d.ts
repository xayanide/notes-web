// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
  namespace App {
    // interface Error {}
    interface Locals {
      user:
        | {
            id: number;
            name: string | null;
            username: string;
            email: string;
            status: UserStatus;
            role: UserRole;
            createdAt: Date;
          }
        | undefined;
    }
    // interface PageData {}
    // interface PageState {}
    // interface Platform {}
  }
}

export {};
