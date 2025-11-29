# ???

## Prerequisites
- Terminal
- Code Editor
- JavaScript Runtime Environment
- Package Manager
- PostgreSQL Database Server: https://www.postgresql.org/download

## Usage

### 1. Install dependencies
```sh
npm install
````

### 2. Set up the database

Make sure the PostgreSQL database server is running, then run migrations:

```sh
npx prisma migrate dev
```

Generate the Prisma client:

```sh
npx prisma generate
```

### 3. Start the development server

```sh
npm run dev
```

This will start the server and you can view your app in the browser.

## Database Management

### 1. Editing the schema
Prisma uses a schema file to define your database structure. The file is usually located at `prisma/schema.prisma`.

- Open `prisma/schema.prisma` in your code editor.
- Make the desired changes to models (tables), fields (columns), or its attributes.
- Save the file.

### 2. Applying schema changes (migrations)
After editing the schema, run the following commands to update the database and generate the Prisma client:

```sh
# Create and apply a migration
npx prisma migrate dev --name meaningful_migration_name

# Regenerate Prisma client
npx prisma generate
```

**Tips:**

* Use a descriptive migration name instead of `meaningful_migration_name`, e.g., `add_user_table`.
* Always check your changes on a local or development database first.

### 3. Backup the database

To backup your PostgreSQL database:

```sh
# Export database to a file
pg_dump -U your_db_user -h localhost -p 5432 your_db_name > backup.sql
```

* Replace `your_db_user` with your PostgreSQL username.
* Replace `your_db_name` with your database name.
* `backup.sql` will be the file containing the backup.

### 4. Restore the database

To restore from a backup file:

```sh
# Restore database from backup.sql
psql -U your_db_user -h localhost -p 5432 your_db_name < backup.sql
```

* Ensure the target database (`your_db_name`) already exists or create it beforehand:

```sh
createdb -U your_db_user -h localhost your_db_name
```

For more information refer to DB_BACKUP.md

### 5. Resetting the database (development only)

If you want to reset the database completely and reapply migrations:

```sh
npx prisma migrate reset
```

* This will **erase all data** in the database, reapply all migrations, and regenerate the Prisma client.
* Only use this in development, never in production.

## Tech Stack

### Git Repository Hosting Service
- GitHub

### Distributed Version Control Sysem
- Git

### IDE / Code Editor
- Visual Studio Code

### JavaScript Runtime Environment
- Node.JS, Bun

### Package Managers
- npm, bun, pnpm

### Backend
- Prisma ORM (A library that helps with the process of making database operations from the web app)
- PostreSQL (Client-Server Relational Database)
- SvelteKit (Backend Framework)
- TypeScript (Superset of JavaScript with static typing)

### Frontend
- HTML
- JavaScript
- CSS
- Svelte (UI Components)
- SvelteKit (Frontend Framework)
- TailwindCSS (CSS Framework)
- Flowbite-Svelte (Svelte UI Components)

### Frontend Build Tools
- Vite

### Development Tools
- ESLint (Code linter)
- Prettier (Opinionated code formatter)

### Authentication / Security
- argon2 (Password hashing)
- jose (JWT and cryptography)
- cookie (Cookie parsing)
- cookie-signature (Signing cookies)

### General Schema Validator
- zod

### Environment Management
- dotenv

---

The rest of the README below is auto-generated `npx sv create myapp`

# sv

Everything you need to build a Svelte project, powered by [`sv`](https://github.com/sveltejs/cli).

## Creating a project

If you're seeing this, you've probably already done this step. Congrats!

```sh
# create a new project in the current directory
npx sv create

# create a new project in my-app
npx sv create my-app
```

## Developing

Once you've created a project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```sh
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

To create a production version of your app:

```sh
npm run build
```

You can preview the production build with `npm run preview`.

> To deploy your app, you may need to install an [adapter](https://svelte.dev/docs/kit/adapters) for your target environment.
