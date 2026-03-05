/**
 * Direct Postgres connection for lead engine cockpit routes.
 * The lead engine writes to Postgres directly (no backend API).
 * These routes query the same tables: accounts, contacts, scrape_state.
 *
 * Connection uses LEAD_DB_* env vars, falling back to DB_* vars.
 */
import pg from "pg";

const { Pool } = pg;

let pool: pg.Pool | null = null;

export function getLeadEnginePool(): pg.Pool {
  if (!pool) {
    pool = new Pool({
      host: process.env.LEAD_DB_HOST || process.env.DB_HOST || "localhost",
      port: parseInt(process.env.LEAD_DB_PORT || process.env.DB_PORT || "5432", 10),
      database: process.env.LEAD_DB_NAME || process.env.DB_NAME || "salesman",
      user: process.env.LEAD_DB_USER || process.env.DB_USER || "postgres",
      password: process.env.LEAD_DB_PASSWORD || process.env.DB_PASSWORD || "postgres",
      max: 5,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    });
  }
  return pool;
}
