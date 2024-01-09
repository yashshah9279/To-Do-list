import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import {} from "dotenv/config";

const app = express();
const port = 3000;

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "permalist",
  password: process.env.PASSWORD,
  port: 5432,
});
db.connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

let items = [
  { id: 1, title: "Buy milk" },
  { id: 2, title: "Finish homework" },
];

async function getItems(){
  const result=await db.query("SELECT * from items ORDER BY id ASC;");
  //console.log(result.rows);
  return result.rows;
}

app.get("/", async (req, res) => {
  const itemsupdated=await getItems();
  res.render("index.ejs", {
    listTitle: "Today",
    listItems: itemsupdated,
  });
});

app.post("/add", (req, res) => {
  const item = req.body.newItem;
  db.query("INSERT INTO items (title) VALUES ($1) RETURNING *",[item]);
  res.redirect("/");
});

app.post("/edit", (req, res) => {
  console.log(req.body);
  const itemId=req.body.updatedItemId;
  const updTitle=req.body.updatedItemTitle;
  db.query("UPDATE items SET title=$1 WHERE id=$2",[updTitle,itemId]);
  res.redirect("/");
});

app.post("/delete", (req, res) => {
  console.log(req.body);
  db.query("DELETE FROM items WHERE id=$1",[req.body.deleteItemId]);
  res.redirect("/");
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
