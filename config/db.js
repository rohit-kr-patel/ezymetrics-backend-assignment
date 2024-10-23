const mongoose = require("mongoose");

const connectDB = async () => {
    try{
        await mongoose.connect("mongodb+srv://admin:admin@cluster0.gjuq7.mongodb.net/Ezymetrics")
    }catch(err){
        console.error(err);
    }
}


module.exports = connectDB;