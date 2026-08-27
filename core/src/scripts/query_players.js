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
    // Check Player table
    const players = await pool.query(`
      SELECT p.id, p."discordUserId", p."franchiseId", p."gameId", g.title as game_title 
      FROM player p 
      LEFT JOIN game g ON p."gameId" = g.id 
      WHERE p."discordUserId" IN (839331691452563466, 202600141260193792, 153307046186450945, 214533658424508427)
    `);
    console.log("=== PLAYER RECORDS ===");
    console.log(JSON.stringify(players.rows, null, 2));
    
    // Check User table
    const users = await pool.query(`
      SELECT id, discord_id, username, email
      FROM users 
      WHERE discord_id IN (839331691452563466, 202600141260193792, 153307046186450945, 214533658424508427)
    `);
    console.log("\n=== USER RECORDS ===");
    console.log(JSON.stringify(users.rows, null, 2));
    
  } catch(e) {
    console.error("Error:", e.message);
  } finally {
    await pool.end();
  }
}

main();
