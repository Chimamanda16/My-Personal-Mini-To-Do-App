const mongoose = require("mongoose");


// Creating a Schema
const List = new mongoose.Schema({
    Name: String,
    Todo: []
});

// Creating a model
module.exports = mongoose.model("List", List);