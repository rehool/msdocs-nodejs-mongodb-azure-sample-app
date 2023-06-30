var createError = require("http-errors");
var express = require("express");
var mongoose = require("mongoose");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var snowflake = require("snowflake-sdk");
const { format } = require("date-fns");

// 1st party dependencies
var configMongoConn = require("./config/connection");
var configSfConn = require("./config/snowflake_connection");
var indexRouter = require("./routes/index");
var exampleRouter = require("./routes/example_restful");
var testSnowflake = require("./routes/test_snowflake");

async function getApp() {

  // create the connection instance for mongo
  console.log("Connecting to MongoDB...");
  var connectionInfo = await configMongoConn.getConnectionInfo();
  mongoose.connect(connectionInfo.DATABASE_URL);
  console.log("Connected to MongoDB.");

  // create the connection pool instance for snowflake
  //console.log("Connecting to Snowflake...");
  //var connPool = await configSfConn.getSnowflakeConnection();
  //console.log("Connected to Snowflake.");

  var app = express();

  // set the port, use environment variable if available
  var port = normalizePort(process.env.PORT || '3000');
  app.set('port', port);

  // view engine setup
  app.set("views", path.join(__dirname, "views"));
  app.set("view engine", "pug");

  app.use(logger("dev"));
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  app.use(cookieParser());
  app.use(express.static(path.join(__dirname, "public")));

  app.locals.format = format;

  app.use("/", indexRouter);
  app.use("/", exampleRouter);
  app.use("/", testSnowflake);
  app.use("/js", express.static(__dirname + "/node_modules/bootstrap/dist/js")); // redirect bootstrap JS
  app.use(
    "/css",
    express.static(__dirname + "/node_modules/bootstrap/dist/css")
  ); // redirect CSS bootstrap

  // catch 404 and forward to error handler
  app.use(function (req, res, next) {
    next(createError(404));
  });

  // error handler
  app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get("env") === "development" ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render("error");
  });

  return app;
}
 // Normalize a port into a number, string, or false.
 function normalizePort(val) {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}
module.exports = {
  getApp
};
