const express=require('express');
const body_parser = require('body-parser');
const userRouter = require('./routes/userRoute');
const orderRouter = require('./routes/orderRoutes');
// app.js - ADD THESE LINES AT THE VERY TOP
const mongoose = require('mongoose');

// CRITICAL: Clear mongoose cache
if (mongoose.connection.models) {
  delete mongoose.connection.models['users'];
  delete mongoose.connection.models['otps'];
}

mongoose.models = {};
mongoose.modelSchemas = {};

 const app = express();
 app.use(body_parser.json());


 app.use('/',userRouter);

 app.use('/',orderRouter);

  module.exports=app;