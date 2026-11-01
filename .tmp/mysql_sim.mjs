import { spawn } from "node:child_process";
import { promises as fs } from "node:fs";
import { join } from "node:path";

const sku = process.platform === "win32" ? "windows-x64" : "osx-universal";
const binDir = join(process.cwd(), "node_modules", "@embedded-postgres", sku, "native", "bin");
const mysqld = join(binDir, process.platform === "win32" ? "mysqld.exe" : "mysqld");

await fs.mkdir(join(process.cwd(), ".tmp", "mysql-data"), { recursive: true });

const mysqldChild = spawn(mysqld, [
  "--verbose",
  "--general_log",
  "--skip-networking",
  "--port=3306",
  "--socket=/tmp/mysql.sock",
  "--datadir=" + join(process.cwd(), ".tmp", "mysql-data"),
  "--user=" + (process.platform === "win32" ? "nt" : process.env.USER || "root"),
  "--default-authentication-plugin=mysql_native_password",
  "--default-storage-engine=INNODB",
], { stdio: ["ignore", "ignore", "ignore"], windowsHide: true });

let alive = true;
const timeout = setTimeout(() => {
  mysqldChild.kill("SIGKILL");
  process.exit(1);
}, 30000);

mysqldChild.on("exit", (code) => {
  if (alive && code !== 0) {
    console.error("mysqld falló con código", code);
    process.exit(code ?? 1);
  }
});

const mysql = spawn("mysql", ["-S", "/tmp/mysql.sock", "-uroot", "-e", "SELECT 1"], {
  stdio: ["ignore", "ignore", "ignore"],
  windowsHide: true,
});
mysql.on("exit", (code) => {
  if (alive && code !== 0) {
    console.error("no se pudo conectar al server de MySQL");
    process.exit(1);
  }
});

for (;;) {
  const checker = spawn("mysql", ["-S", "/tmp/mysql.sock", "-uroot", "-e", "SELECT 1"], {
    stdio: ["ignore", "ignore", "ignore"],
    windowsHide: true,
  });
  const [ok] = await new Promise((resolve) => {
    checker.on("close", (c) => resolve(c === 0));
  });
  if (ok) break;
  await new Promise((resolve) => setTimeout(resolve, 500));
}

console.log("READY: mysql://root@localhost:3306/ortodoncia_db");
process.stdin.resume();
process.on("SIGTERM", () => {
  alive = false;
  mysqldChild.kill();
  mysql.kill();
  process.exit(0);
});
