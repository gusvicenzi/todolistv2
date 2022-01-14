const express = require("express");
const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

// const items = ["Buy food", "Cook food", "Eat food"];
// const workItems = [];

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

// Creating the mongo database using mongoose
const url =
  "mongodb+srv://admin-gustavo:Test123@cluster0.er9gn.mongodb.net/todolistDB";
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

const listSchema = new mongoose.Schema({
  name: String,
  items: [itemsSchema],
});

const List = mongoose.model("List", listSchema);

var firstRun = 1;
// _________________________________________________

app.get("/", function (req, res) {
  const day = date.getDate();
  // get Mongodb data
  Item.find({}, function (err, foundItems) {
    if (foundItems.length === 0 && firstRun === 1) {
      // insert defaultItems to items collection
      Item.insertMany(defaultItems, function (err) {
        if (err) {
          console.log(err);
        } else {
          console.log("Default items added to database");
        }
      });
      firstRun = 0;
      res.redirect("/");
    } else {
      // mongoose.connection.close();
      res.render("list", { listTitle: day, newListItems: foundItems });
      foundItems.forEach(function (foundItem) {
        console.log(foundItem.name);
      });
    }
  });
});

app.post("/", function (req, res) {
  const day = date.getDate();
  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName,
  });

  if (itemName) {
    if (listName === day) {
      item.save();
      res.redirect("/");
    } else {
      List.findOne({ name: listName }, function (err, foundList) {
        foundList.items.push(item);
        foundList.save();
        res.redirect("/" + listName);
      });
    }
  } else {
    if (listName === day) {
      res.redirect("/");
    } else {
      res.redirect("/" + listName);
    }
  }
});

// custom lists
app.get("/:customListName", function (req, res) {
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({ name: customListName }, function (err, foundList) {
    if (!err) {
      if (foundList) {
        console.log("List already exists: " + foundList.name);
        res.render("list", {
          listTitle: foundList.name,
          newListItems: foundList.items,
        });
      } else {
        // create new list with default items
        const list = new List({
          name: customListName,
          items: defaultItems,
        });
        list.save();
        console.log("New list created: " + list);
        res.redirect("/" + customListName);
      }
    } else {
      console.log(err);
    }
  });
});

// delete item
app.post("/delete", function (req, res) {
  const day = date.getDate();
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === day) {
    Item.findByIdAndRemove({ _id: checkedItemId }, function (err) {
      if (err) {
        console.log(err);
      } else {
        console.log("Item deleted: " + checkedItemId);
        res.redirect("/");
      }
    });
  } else {
    List.findOneAndUpdate(
      { name: listName },
      { $pull: { items: { _id: checkedItemId } } },
      function (err, foundList) {
        if (err) {
          console.log(err);
        } else {
          res.redirect("/" + listName);
        }
      }
    );
  }
});

app.get("/about", function (req, res) {
  res.render("about");
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function () {
  console.log("Server has started successfully " + port);
});
