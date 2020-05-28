const express = require("express");
const { Pool } = require("pg");

const app = express();
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const PORT = process.env.PORT || 3000;

pool.query(`
  SET TIMEZONE='US/Eastern';
  CREATE TABLE IF NOT EXISTS votes(
    id SERIAL PRIMARY KEY,
    donut VARCHAR(256) NOT NULL,
    voter VARCHAR(256) NOT NULL,
    date DATE DEFAULT CURRENT_DATE
  );
  CREATE UNIQUE INDEX IF NOT EXISTS votes_voter_date on votes (voter, date);
`);

app.use(express.static("public"));
app.use(express.json());

app.post("/votes", async (req, res) => {
  const { voter, donut } = req.body;
  await pool.query(
    `DELETE FROM votes where voter = $1 AND date = CURRENT_DATE;`,
    [voter]
  );
  await pool.query(
    `INSERT INTO votes (voter, donut, date) VALUES ($1, $2, CURRENT_DATE);`,
    [voter, donut]
  );
  res.sendStatus(200);
});

app.get("/votes", async (req, res) => {
  const { rows } = await pool.query(
    `SELECT * FROM votes WHERE date = CURRENT_DATE;`
  );
  const votes = rows.reduce((object, row) => {
    object[row.donut] = object[row.donut] ? ++object[row.donut] : 1;
    return object;
  }, {});
  res.json(votes);
});

app.listen(PORT, console.log(`Server listening on port ${PORT} 🚀`));
