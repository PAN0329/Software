const express = require('express');
const mysql = require('mysql2'); // 使用 mysql2 來處理 MySQL 連接
const config = require('./config'); // 引入資料庫配置
const app = express.Router();

// 初始化資料庫連接
const connection = mysql.createConnection(config.db);

// 連接到資料庫
connection.connect((err) => {
    if (err) {
        console.error('Error connecting to the database:', err.stack);
        return;
    }
    console.log('Connected to database');
});

function doSQL(SQL, parms, res, callback) {
    // 確保 connection 已初始化
    if (!connection) {
        res.status(500).send("Database connection is not initialized.");
        return;
    }

    // 執行 SQL 語句
    connection.execute(SQL, parms, function (err, data) {
        if (err) {
            console.log(err);
            res.status(404).send(err.sqlMessage);
        } else {
            callback(data);
        }
    });
}

// 獲取所有 Product 資料
app.get(['/', '/index'], function (req, res) {
    let SQL = "SELECT product_id, product_name, category_id, price FROM Product ORDER BY product_id";
    doSQL(SQL, [], res, function (data) {
        res.render('LookUp/index', {
            data: data,
            partials: { row: 'LookUp/row' },
        });
    });
});

// 查詢特定類型的產品
app.get("/typedList", function (req, res) {
    let SQL = "SELECT product_id, product_name, price FROM Product WHERE category_id = ?";
    doSQL(SQL, [req.query.category_id], res, function (data) {
        res.render('LookUp/list', {
            products: data,
            partials: { row: 'LookUp/row' },
        });
    });
});

// 搜尋產品頁面
app.get("/search", function (req, res) {
    res.render('LookUp/search');
});

// 搜尋結果
app.get("/searchResult", function (req, res) {
    const keyword = "%" + req.query.keyword + "%";
    let SQL = "SELECT product_id, product_name, category_id, price FROM Product WHERE product_name LIKE ?";
    doSQL(SQL, [keyword], res, function (data) {
        res.render('LookUp/list', {
            products: data,
            partials: { row: 'LookUp/row' },
        });
    });
});

// 更新 Product 資料
app.put("/:product_id", function (req, res) {
    let showRow = function () {
        let SQL = "SELECT product_id, product_name, category_id, price FROM Product WHERE product_id = ?";
        doSQL(SQL, [req.params.product_id], res, function (data) {
            res.render('LookUp/row', {
                product_id: data[0].product_id,
                product_name: data[0].product_name,
                category_id: data[0].category_id,
                price: data[0].price,
            });
        });
    };

    if (req.body.action === "update") {
        let SQL = "UPDATE Product SET product_name = ?, category_id = ?, price = ? WHERE product_id = ?";
        const { product_name, category_id, price } = req.body;
        const product_id = req.params.product_id;
        doSQL(SQL, [product_name, category_id, price, product_id], res, function () {
            showRow();
        });
    } else {
        showRow();
    }
});

module.exports = app;
