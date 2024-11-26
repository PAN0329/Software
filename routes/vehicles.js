const express = require('express');
const app = express.Router();

app.get('/', function (req, res) {
    // Updated SQL query to format prices conditionally
    let SQL = `
        SELECT product_id, product_name, price
        FROM Products
        ORDER BY price
    `;

    app.connection.query(SQL, function (err, data) {
        if (err) {
            console.log("Error fetching data: ", err);
            res.status(404).send(err.sqlMessage);
        } else {
            res.render('vehicles/index', {
                data: data
            });
        }
    });
});

app.post('/add', function (req, res) {
    const { product_name, price } = req.body;

    let SQL = `INSERT INTO Products (product_name, price) VALUES (?, ?)`;
    app.connection.query(SQL, [product_name, price], function (err) {
        if (err) {
            console.log("Error inserting data: ", err);
            res.status(500).send(err.sqlMessage);
        } else {
            res.redirect('/vehicles'); 
        }
    });
});

app.post('/delete/:product_id', function (req, res) {
    const product_id = req.params.product_id;

    const SQL = `DELETE FROM Products WHERE product_id = ?`;
    app.connection.query(SQL, [product_id], function (err) {
        if (err) {
            console.log("Error deleting vehicle: ", err);
            res.status(500).send(err.sqlMessage);
        } else {
            res.redirect('/vehicles');
        }
    });
});

app.get('/edit/:product_id', (req, res) => {
    const product_id = req.params.product_id;
    const SQL = `SELECT * FROM Products WHERE product_id = ?`;

    app.connection.query(SQL, [product_id], (err, results) => {
        if (err) {
            console.error("Error fetching vehicle:", err);
            res.status(500).send("Error fetching vehicle details");
        } else {
            res.render('vehicles/edit', { vehicle: results[0] });
        }
    });
});

app.post('/edit/:product_id', (req, res) => {
    const product_id = req.params.product_id;
    const { product_name, price } = req.body;

    const SQL = `UPDATE Products SET product_name = ?, price = ? WHERE product_id = ?`;
    app.connection.query(SQL, [product_name, price, product_id], (err) => {
        if (err) {
            console.error("Error updating vehicle:", err);
            res.status(500).send("Error updating vehicle");
        } else {
            res.redirect('/vehicles');
        }
    });
});
module.exports = app;
