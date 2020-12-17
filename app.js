const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
var multer = require("multer");
const passport = require("passport");
var db = require("./models/index");

const app = express();

// Static folder
app.use(express.static(path.join(__dirname, "./public")));
// app.use("/dashboard", express.static(path.join(__dirname, './public/dashboard')));

//Body Parser Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.engine("html", require("ejs").renderFile);
app.set("view engine", "html");
app.set("views", __dirname + "./public");

app.use(passport.initialize());

require("./config/passport");
require("./routes/user.js")(app);
require("./routes/payment.js")(app);
require("./routes/blog.js")(app);

app.get("/", (req, res) => {
  // res.render('contact');
  res.sendFile(__dirname + "./public/index.html");
});
var Storage = multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, "./public/images");
  },
  filename: function (req, file, callback) {
    // console.log(file);
    callback(null, file.fieldname + "_" + Date.now() + "_" + file.originalname);
  },
});
var upload = multer({
  storage: Storage,
});

app.post("/api/Upload", upload.single("imgUploader"), function (req, res) {
  // upload(req, res, function (err) {
  // console.log(req.file)
  let fileLink = req.headers.origin + "/images/" + req.file.filename;
  console.log(fileLink);
  return res.json({
    success: true,
    msg: "File uploaded sucessfully!.",
    link: fileLink,
  });
  // });
});

// USE BELOW IN DEVELOPMENT AS IT WILL DELETE THE DATABASE
// db.sequelize.sync({ force: true }).then(() => {
//     console.log("Drop and resync db")
// })

// USE BELOW IN PRODUCTION AS IT WILL NOT DELETE THE DATABASE
// db.sequelize.sync().then(() => {
//   console.log("Drop and resync db");
// });

app.listen(3000, () => console.log("Server started.."));
