const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://UVSinghK:UVSinghK@todolist@cluster0.3tlvi.mongodb.net/todolistDB?retryWrites=true&w=majority", {useNewUrlParser: true, useUnifiedTopology: true});

const itemsSchema = new mongoose.Schema({
                    name: String });

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
                        name: "JavaScript"
                      });
const item2 = new Item({
                        name: "Python"
                      });
const item3 = new Item({
                        name: "NodeJS"
                      });

var defaultItems = [item1, item2, item3]

const listSchema = {
  name: String,
  items: [itemsSchema]
};

const List = new mongoose.model("List", listSchema);

app.get("/", function(req, res){
  Item.find({}, (err, items) => {
      if(items.length === 0){
        Item.insertMany(defaultItems, (err) => {
          if(err)
            console.log(err);
          else{
            console.log("Inserted elements successfuly");
          }
        });
        res.redirect("/");
      }else{
        res.render("list", { listTitle: "Today", listItems: items });
      }
  });
});

app.post("/", function(req, res){
  var item = req.body.item;
  var listName = req.body.list;

  var newItem = new Item({ name: item });

  if (listName == "Today") {
    newItem.save();
    res.redirect("/");
  } else {
    List.findOne({ name: listName }, function(err, foundList){
      foundList.items.push(newItem);
      foundList.save();
      res.redirect("/"+listName);
    });
  }
});

app.post("/delete", function(req, res){
  const checkedItemId = req.body.checkBox;
  const listTitle = req.body.listTitle;

  if(listTitle == "Today"){
    Item.findByIdAndDelete(checkedItemId, function(err){
      if(!err){
        console.log("Deleted successfuly.");
        res.redirect("/");
      }
    });
  }else{
    List.findOneAndUpdate({ name: listTitle }, {$pull: {items: {_id: checkedItemId}}}, function(err, foundList){
      if (!err){
        res.redirect("/"+listTitle);
      }
    });
  }
});

app.get("/:listName", function(req, res){
  const customListName = _.capitalize(req.params.listName);

  List.findOne({name: customListName}, function(err, listItems){
    if(!listItems){
      // Create list
      const list = new List({
        name: customListName,
        items: defaultItems
      });

      list.save();
      res.redirect("/"+customListName);
    }else{
      // Show the list
      res.render('list', { listTitle: customListName, listItems: listItems.items })
    }
  })
});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function(){
  console.log("Listening on port 3000...");
});
