const express = require("express");
const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");

const port = 3000;
const app = express();

// const items = ["Buy food", "Cook food", "Eat food"];
// const workItems = [];

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

// Creating the mongo database using mongoose
const url = "mongodb://localhost:27017/todolistDB";
mongoose.connect(url);

const itemsSchema = new mongoose.Schema({
  name: String,
});

const Item = mongoose.model("Item", itemsSchema);

// default items

const item1 = new Item({
  name: "Welcome to your todolist!",
});

const item2 = new Item({
  name: "Hit the + button to add a new item.",
});

const item3 = new Item({
  name: "<-- Hit this box to delete the item.>",
});

const defaultItems = [item1, item2, item3];

// Item.insertMany(defaultItems, function (err) {
//   if (err) {
//     console.log(err);
//   } else {
//     console.log("Default items added to database");
//   }
// });

// _________________________________________________

app.get("/", function (req, res) {
  const day = date.getDate();

  Item.find({}, function (err, foundItems) {
    if (err) {
      console.log(err);
    } else {
      mongoose.connection.close();
      res.render("list", { listTitle: day, newListItems: foundItems });
      foundItems.forEach(function (foundItem) {
        console.log(foundItem.name);
      });
    }
  });
});

app.post("/", function (req, res) {
  const item = req.body.newItem;
  if (req.body.list === "Work") {
    if (item != "") {
      workItems.push(item);
    }
    res.redirect("/work");
  } else {
    if (item != "") {
      items.push(item);
    }
    res.redirect("/");
  }
});

app.get("/work", function (req, res) {
  res.render("list", { listTitle: "Work List", newListItems: workItems });
});

app.post("/work", function (req, res) {
  const item = req.body.newItem;
  if (item != "") {
    workItems.push(item);
  }
  res.redirect("/work");
});

app.get("/about", function (req, res) {
  res.render("about");
});

app.listen(port, function () {
  console.log("Server runing on port " + port);
});
