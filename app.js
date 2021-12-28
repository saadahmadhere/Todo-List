const express = require("express");
const mongoose = require("mongoose");
const _ = require("lodash");
const date = require(__dirname + "/date.js");

const app = express();
const day = date.getDate();


app.set('view engine', 'ejs');
app.use(express.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-saad:123-test@cluster0.rgbmq.mongodb.net/todolistDB").then(()=>{console.log("db connected!")})

const itemsSchema = new mongoose.Schema({
  name: String 
})

const Item = mongoose.model("Item", itemsSchema)

const item1 = new Item({
  name: "Eat"
})


const item2 = new Item({
  name: "Sleep"
})

const item3 = new Item({
  name: "Conquer"
})

const defaultItems = [item1, item2, item3];

const listSchema = new mongoose.Schema({
  name: String,
  items: [itemsSchema]
})

const List = mongoose.model("List", listSchema);

app.get("/", function(req, res) {
  
  Item.find({}, (err, foundItems)=>{
    if(foundItems.length === 0){
      
      Item.insertMany(defaultItems, (err) =>{
        if(!err){
          console.log("Items added successfully.")
        }else{
          console.log("There was some error!");
        }
      })
      res.redirect("/");

    }else{
      res.render("list", {listTitle: day, newListItems: foundItems});
    }
  })
  
});

app.get("/:customRoute", (req,res) =>{

  const customListName = _.capitalize(req.params.customRoute);

  List.findOne({name: customListName}, (err, foundList)=>{
    if(!err){
      if(!foundList){
          const list = new List({
            name: customListName,
            items: defaultItems
          });
        
          list.save().then(()=>{
            res.redirect("/"+customListName)

          })
        
          
      } else{
        res.render("list", {listTitle: customListName, newListItems: foundList.items})
      }
      
    }
  })

})

app.post("/", function(req, res){
  
    const itemName = req.body.newItem;
    const listName = (req.body.list).trim();
    
    const item = new Item({
      name: itemName
    })
    
    if(listName === day){
      item.save();
      res.redirect("/");
    } else {

      List.findOne({name: listName}, (err, foundList)=>{
        if(!err){
          if(foundList){
            foundList.items.push(item);
            foundList.save();
            res.redirect('/'+listName);        
          }
        }
      })
      // res.redirect("/"+listName);
    }
    
  });
  
  
app.post("/delete", (req,res)=>{
  
  const id = (req.body.checkbox).trim();
  const listName = (req.body.listName).trim();

  if(listName === day){
    Item.findByIdAndRemove(id, err=>{
      if(!err){
        res.redirect("/");
      }
    });
  }else{
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: id}}}, (err, foundItems)=>{
      if(!err){
        console.log(foundItems);
        res.redirect("/"+listName);
      }
    })  
    // List.items.pull(id);
    // List.save();
    // res.redirect("/"+listName)
  }
  
})


app.get("/about", function(req, res){
  res.render("about");
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function() {
  console.log("Server started successfully.");
});
