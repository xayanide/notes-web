### 1. Export / Dump the Database

Use `pg_dump` to export your `mydatabase` database:

```bash
pg_dump -U postgres -F c -b -v -f "F:\mydatabase.backup" mydatabase
```

Explanation:

- `-U postgres` username
- `-F c` ustom format (recommended for backup/restore)
- `-b` include large objects
- `-v` verbose
- `-f` output file path
- `mydatabase` database name

This will produce a single `.backup` file that contains your entire database.

---

### 2. Copy the Backup File

- Put `mydatabase.backup` on a USB drive or cloud storage.
- Take it to your work laptop.

---

### 3. Restore on the Work Laptop

Make sure PostgreSQL is installed on your work laptop. Then, create an empty database and restore:

```bash
createdb -U postgres mydatabase
pg_restore -U postgres -d mydatabase -v "F:\mydatabase.backup"
```

- `createdb` - creates the empty database
- `pg_restore` - restores the backup into that database

---

### Optional: Dump as SQL

If you prefer a SQL file that you can inspect or modify:

```bash
pg_dump -U postgres -F p -v -f "F:\mydatabase.sql" mydatabase
```

- `-F p` - plain SQL
- You can restore using `psql`:

```bash
psql -U postgres -d mydatabase -f "F:\mydatabase.sql"
```
