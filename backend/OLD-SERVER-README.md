# OLD SERVER README (ARCHIVED)

This was the original MySQL-based server setup. The project has been refactored to use PostgreSQL.

## Legacy MySQL Configuration

```bash
# Set DATABASE_URL for MySQL
export DATABASE_URL=mysql://root:root@localhost:3306/subscription_app
```

## Current Setup

- **Database**: PostgreSQL (with NeonDB support)
- **Entry Point**: `server.js`
- **Initialization**: `init_db.js` (PostgreSQL version)
- **Configuration**: `.env` file with PostgreSQL credentials

## Files in this directory

- `old-server-index.js` - Archived MySQL API server
- `old-test-conn.js` - Archived MySQL connection test
- `OLD-SERVER-README.md` - This file
- Other files use PostgreSQL
