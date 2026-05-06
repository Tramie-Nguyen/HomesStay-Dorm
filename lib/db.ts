// import sql from "mssql";

// const config: sql.config = {
//   user: process.env.DB_USER,
//   password: process.env.DB_PASSWORD,
//   server: process.env.DB_SERVER!,
//   database: process.env.DB_NAME,
//   options: {
//     encrypt: false,
//     trustServerCertificate: true,
//   },
// };

// let pool: sql.ConnectionPool | null = null;

// export async function getPool(): Promise<sql.ConnectionPool> {
//   if (!pool) {
//     pool = await sql.connect(config);
//   }
//   return pool;
// }

import sql from "mssql";

const connectionString = process.env.DB_CONNECTION_STRING!;
// Ví dụ:
// "Server=localhost;Database=myDB;User Id=sa;Password=123456;TrustServerCertificate=true;Encrypt=false"

let pool: sql.ConnectionPool | null = null;

export async function getPool(): Promise<sql.ConnectionPool> {
  if (!pool) {
    pool = await sql.connect(connectionString);
  }
  return pool;
}