const express = require("express");
const db = require("mysql2");
const cookieParser = require('cookie-parser');

const app = express();

app.use(cookieParser('secretingredient'));

app.set("view engine", "hjs");
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

const configs = require("./config");
const connection = db.createConnection(configs.db);

connection.connect((err) => {
    if (err) {
        console.log("Error connecting to database: ", err);
        process.exit();
    } else {
        console.log("Connected to database");
    }
});

app.get("/", (req, res) => {
    if (req.get("HX-Request")) {
        res.send(
            '<div class="text-center">' +
            '<i class="bi bi-truck" style="font-size: 50vh;"></i>' +
            "</div>",
        );
    } else {
        res.render("layout", {
            title: "Welcome to Vehicle Rent",
            loggedIn: req.signedCookies.loggedIn === 'true',
            flash: req.signedCookies.flash,
            partials: {
                navbar: "navbar",
            },
        });
    }
});

app.get("/*", function (req, res, next) {
    if (req.get("HX-Request")) {
        next();
    } else {
        res.render("layout", {
            title: "Welcome to Vehicle Rent",
            partials: {
                navbar: "navbar",
            },
            where: req.url,
        });
    }
});

const vehicles = require('./routes/vehicles');
vehicles.connection = connection; 
app.use('/vehicles', vehicles);

const service = require('./routes/Service');
service.connection = connection;
app.use('/Service', service);

const categories = require("./routes/Categories");
categories.connection = connection;
app.use("/categories", categories);

const Transactions = require("./routes/Transactions");
Transactions.connection = connection;
app.use("/Transactions", Transactions);

const LookUp = require('./routes/LookUp');
LookUp.connection = connection;
app.use('/LookUp', LookUp);

const login = require('./routes/login');
login.connection = connection;
app.use('/login', login);

app.listen(80, function () {
 console.log('Web server listening on port 80!\nWeb server is running on http://localhost:8080');
});