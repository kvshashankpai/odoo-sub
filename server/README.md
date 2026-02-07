Postgres API server

Quick start

1. Install dependencies from the project root:

```bash
npm install
```


2. Create a MySQL database and set `DATABASE_URL` environment variable. Example local URL:

```
export DATABASE_URL=mysql://root:root@localhost:3306/subscription_app
```

On Windows (PowerShell):

```powershell
$env:DATABASE_URL = "mysql://root:root@localhost:3306/subscription_app"
```

3. Initialize the database (creates tables and seeds sample data):

```bash
node server/init_db.js
```

4. Run the API server (development):

```bash
npm run server:dev
```

The React dev server is proxied to `http://localhost:5000` for `/api/*` requests.
