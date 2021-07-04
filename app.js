//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));

app.use(express.static("public"));


mongoose.connect("mongodb+srv://khadyothan:N4LGaxn6xPZrTdZ@cluster0.pdrf6.mongodb.net/todolistDB", {useNewUrlParser: true, useUnifiedTopology: true},);

// Creating the schema
const itemSchema = mongoose.Schema({
  name: String,
});

// Creating the model object
const Item = mongoose.model("Item", itemSchema);

// Create the document
item1 = new Item({
  name: "Welcome to ToDoList",
});

item2 = new Item({
  name: "<-- Click on this to delete",
});

const defaultItems = [item1, item2];

const listSchema = mongoose.Schema({
  name: String,
  items: [itemSchema],
});

List = mongoose.model("List", listSchema);


app.get("/", function(req, res){

  const day = date.getDate();

  Item.find({}, function(err, results){

    if (results.length === 0) {
      Item.insertMany(defaultItems, function(err){
        if (err){
          console.log(err);
        }else {
          console.log("Succesfully Saved default items to DB");
        }
      });
    }

    res.render("list", {listTitle: day, newListItems: results});

  });

});


app.get("/:customListName", function(req, res){
  customListName = _.capitalize(req.params.customListName);

  List.findOne({name: customListName}, function(err, result){
    if (!err) {
      if (!result){
        list = new List({
          name: customListName,
          items: defaultItems,
        });

        list.save();
        res.redirect("/" + customListName);
      } else {
        res.render("list", {listTitle: customListName, newListItems: result.items});
      }
    }
  });

});


app.post("/", function(req, res){
  const day = date.getDate();
  const itemName = req.body.newItem;
  const listName = req.body.list;

  item = new Item({
    name: itemName,
  });

  if (listName === day) {
    item.save();
    res.redirect("/");
  } else {
    List.findOne({name: listName}, function(err, results){
      console.log(results);
      results.items.push(item);
      results.save();
      res.redirect("/" + listName);
    });
  }

});


app.post("/delete", function(req, res){
  const itemId = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === date.getDate()) {
    Item.findByIdAndDelete(itemId, function(err){
      if (!err){
        console.log("Succesfully Deleted!");
        res.redirect("/");
      }
    });
  } else {
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: itemId}}}, function(err, result){
      if (!err) {
        res.redirect("/" + listName);
      }
    });
  }
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 8000;
}
app.listen(port);
