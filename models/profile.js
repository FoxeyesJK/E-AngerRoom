var mongoose = require("mongoose");

var emailSchema = new mongoose.Schema({
    
    recipient: String,
    subject: String,
    contents: String,
    today: String,
    test: String,
    id: String

});

module.exports = mongoose.model("Email", emailSchema);
    