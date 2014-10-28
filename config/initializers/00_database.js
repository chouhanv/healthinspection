/*global module, require, console*/
/*jslint nomen: false*/

// This module connects the `mongoose` ORM to the `Mongo` DB. 
module.exports = function () {

  console.log('Establishing connection to MongoDB');
  // Pretty cool that this is all that's needed to connect to the Mongo DB. 
  mongoose = require('mongoose'),
  dbAddress = ['mongodb://localhost:27017/harris'];
  mongoose.connect('mongodb://localhost:27017/harris');
  console.log('MongoDB Connected');
};