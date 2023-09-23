// Setting up constants
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const dateModule = require(__dirname + "/date.js");
const realDate = dateModule.getDate();
require("dotenv").config();
const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
let genQuote = "Just one small positive thought in the morning can change your whole day";
let genAuthor = "Dalai Lama";

app.use(express.static("public"));
app.use(express.urlencoded({extended:true}));
app.set("view engine", "ejs");

// Making a connection to the database
mongoose.connect(process.env.connectionString).then((response) =>{
    app.listen(5000, function(req, res){
        console.log("Server has started on port 5000");
    });    
}).catch((err) =>{
    console.log(err);
});

// Creating a Schema
const listSchema = new mongoose.Schema({
    Name: String,
    Todo: []
});

// Creating a model
const Item = mongoose.model("List", listSchema);

function getYear(res){
    // API Request For The Motivational Quotes
    const url = "https://type.fit/api/quotes";
    fetch(url).then((response)=>{
        return response.json();
    }).then(function(data){
        var number = Math.floor(Math.random()*15) + 1;
        var quotes = data[number].text;
        var authors = data[number].author;
        Item.find({Name: "Year"}).then((result) =>{
            if(result.length === 0){
                let instead = [{
                    Name: "Empty",
                    Todo: ["Nothing here, add new item"]
                }]
                res.render("index", {itemsArray: instead[0], date: realDate, heading: "2023", quote: quotes, author: authors});
            }
            else{
                res.render("index", {itemsArray: result[0], date: realDate, heading: "2023", quote: quotes, author: authors});
                
            }
        });
    });
}


// Get Request For The Home Route
app.get("/", function(req, res){
    getYear(res);
});

function getMonth(reqMonthNew, res){
    months.forEach((month) =>{
        if(month.includes(reqMonthNew)){
            Item.find({Name: month}).then((response) =>{
                console.log(response);
                if(!response){
                    let emptyList = [{
                        Name: "Empty",
                        Todo: ["Nothing here, add new item"]
                    }]
                    res.render("index", {itemsArray: emptyList[0], date: realDate, heading: month, quote: genQuote, author: genAuthor});
                }
                else{
                    res.render("index", {itemsArray: response[0], date: realDate, heading: month, quote: genQuote, author: genAuthor});
                }
            }).catch((err) =>{
                console.log(err);
            });
        }
    });
}

app.get("/:month", (req, res) =>{
    const reqMonth = req.params.month;
    let reqMonthNew = reqMonth.slice(0, 1).toUpperCase() + reqMonth.slice(1);
    getMonth(reqMonthNew, res);
});

app.post("/", function(req, res){
    let routeName = (req.body.list.slice(0, 3).toLowerCase());
    if(routeName === "202"){
        Item.updateOne({Name: "Year"}, {$push: {Todo: req.body.newitem}}).then((result) =>{
            if(result.modifiedCount === 0 && result.matchedCount === 0){
                let listItem = new Item({
                    Name: "Year",
                    Todo: req.body.newitem
                });
                listItem.save();
            }
        }).catch((err) =>{
            console.log(err);
        });
        getYear(res);
    }
    else{
        let reqMonthNew = routeName.slice(0, 1).toUpperCase() + routeName.slice(1);
        months.forEach((month) =>{
            if(month.includes(reqMonthNew)){
                Item.findOne({Name: month}).then((response) =>{
                    if(response === null){
                        const listItem = new Item({
                            Name: month,
                            Todo: [req.body.newitem]
                        });
                        listItem.save();
                        getMonth(reqMonthNew, res);
                    }
                    else{
                        response.Todo.push(req.body.newitem);
                        response.save();
                        getMonth(reqMonthNew, res);
                    }
                });
            }
        });    
    } 
});