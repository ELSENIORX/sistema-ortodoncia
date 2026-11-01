const mysql = require("mysql2/async");

(async () => {
  const c = new mysql.Client({ host: "localhost", port: 3306, user: "root" });
  try {
    await c.connect();
    const [rows] = await c.query('SHOW DATABASES LIKE "ortodoncia_db"');
    console.log("bases con nombre ortodoncia_db:", JSON.stringify(rows));
    if (rows.length === 0) {
      await c.query("CREATE DATABASE ortodoncia_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
      console.log("base creada");
    }
    const r = await c.query("SELECT 1 AS ok");
    console.log("fecha:", r[0].ok);
  } catch (e) {
    console.error("fallo:", e.message);
    process.exit(1);
  } finally {
    await c.end();
  }
})();
