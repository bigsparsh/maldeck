import express from "express";
const app = express();

app.use(express.json());

app.post("/dashboard", (req, res) => {
  console.log(req.body);
  res.json({
    msg: "Joe Mama",
  });
});

app.listen(3001);
