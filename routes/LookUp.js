const express = require('express');
const app = express.Router();

function doSQL(SQL, parms, res, callback) {
    app.connection.execute(SQL, parms, function (err, data) {
        if (err) {
            console.log(err);
            res.status(404).send(err.sqlMessage);
        } else {
            callback(data); // 執行回呼函式
        }
    });
}

// 獲取所有唯一的類別資料
app.get(['/', '/index'], function (req, res) {
    let SQL = `
        SELECT DISTINCT 
            c.category_id, 
            c.description AS category_description 
        FROM 
            Categories c
        ORDER BY 
            c.category_id
    `;
    doSQL(SQL, [], res, function (data) {
        res.render('LookUp/index', {
            types: data,
        });
    });
});

// 根據 category_id 獲取產品資料
app.get("/typedList", function (req, res) {
    let SQL = "SELECT product_id, product_name, category_id, price FROM Products WHERE category_id = ?";
    doSQL(SQL, [req.query.category_id], res, function (data) {
        res.render('LookUp/list', {
            products: data,
            partials: { row: 'LookUp/row' },
        });
    });
});

// 搜索產品頁面
app.get("/search", function (req, res) {
    res.render('LookUp/search');
});

// 搜索結果
app.get("/searchResult", function (req, res) {
    const keyword = "%" + req.query.keyword + "%";
    let SQL = "SELECT product_id, product_name, category_id, price FROM Products WHERE product_name LIKE ?";
    doSQL(SQL, [keyword], res, function (data) {
        res.render('LookUp/list', {
            products: data,
            partials: { row: 'LookUp/row' },
        });
    });
});

// 價格輸入頁面
app.get("/price", function (req, res) {
    res.render('LookUp/price');
});

// 根據價格範圍獲取產品資料
app.get("/pricefilter", function (req, res) {
    let minPrice = req.query.minPrice;
    let maxPrice = req.query.maxPrice;

    // 檢查參數是否有效
    if (!minPrice || !maxPrice) {
        res.status(400).send("Invalid input parameters");
        return;
    }

    let SQL = `
        SELECT product_id, product_name, category_id, price 
        FROM Products 
        WHERE price BETWEEN ? AND ?
        ORDER BY price ASC
    `;
    doSQL(SQL, [minPrice, maxPrice], res, function (data) {
        res.render('LookUp/list', {
            products: data,
            partials: { row: 'LookUp/row' },
        });
    });
});

module.exports = app;

// 依使用者查找頁面
app.get("/owner", function (req, res) {
    res.render('LookUp/owner');
});

// 根據輸入的 seller_id 和關聯的 product_id 獲取產品資料
app.get("/ownerResult", function (req, res) {
    const sellerId = "%" + req.query.keyword + "%"; // 使用模糊匹配
    console.log("Received seller ID:", sellerId); // 添加日誌
    let SQL = `
        SELECT DISTINCT
            t.seller_id, 
            p.product_id, 
            p.product_name, 
            p.category_id, 
            p.price 
        FROM 
            Products p
        INNER JOIN 
            Transactions t ON p.product_id = t.product_id
        WHERE 
            t.seller_id LIKE ?
        ORDER BY 
            p.product_id
    `;
    doSQL(SQL, [sellerId], res, function (data) {
        console.log("Query Results:", data); // 添加日誌
        if (data.length === 0) {
            res.send("No results found for the given seller ID.");
        } else {
            res.render('LookUp/list_owner', {
                products: data,
                partials: { row: 'LookUp/row_owner' },
            });
        }
    });
});
// 更新產品資料
app.put("/:product_id", function (req, res) {
    let showRow = function () {
        let SQL = "SELECT product_id, product_name, category_id, price FROM Products WHERE product_id = ?";
        doSQL(SQL, [req.params.product_id], res, function (data) {
            res.render('LookUp/row', {
                product_id: data[0].product_id,
                product_name: data[0].product_name,
                category_id: data[0].category_id,
                price: data[0].price,
            });
        });
    };

    if (req.body.action == "update") {
        let SQL = "UPDATE Products SET product_name = ?, category_id = ?, price = ? WHERE product_id = ?";
        doSQL(SQL, [req.body.product_name, req.body.category_id, req.body.price, req.params.product_id], res, function () {
            showRow();
        });
    } else {
        showRow();
    }
});

module.exports = app;
