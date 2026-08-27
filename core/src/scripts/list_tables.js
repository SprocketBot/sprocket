const pg = require("pg");
const pool = new pg.Pool({
  host: "sprocketbot-postgres-d5033d2-do-user-24528890-0.j.db.ondigitalocean.com",
  port: 25060,
  user: "doadmin",
  password: process.env.DATABASE_PASSWORD,
  database: "sprocket_main",
  ssl: { rejectUnauthorized: false }
});

async function main() {
  try {
    // Get all tables in sprocket schema
    const tbls = await pool.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'sprocket' ORDER BY table_name");
    console.log("SPROCKET TABLES:", JSON.stringify(tbls.rows));
    
    // Get user_auth_account columns if exists
    const authTbl = await pool.query("SELECT table_schema, table_name FROM information_schema.tables WHERE table_name = 'user_authentication_account' OR table_name = 'user_auth_account'");
    console.log("AUTH TABLES:", JSON.stringify(authTbl.rows));
    
  } catch(e) { 
    console.error("Error:", e.message); 
  } finally { 
    await pool.end(); 
  }
}

main();
