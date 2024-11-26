const express = require('express');
const app = express.Router();

function doSQL(SQL, parms, res, callback) {
    app.connection.execute(SQL, parms, function (err, data) {
        if (err) {
            console.log(err);
            res.status(404).send(err.sqlMessage);
        } else {
            callback(data);
        }
    });
}

// 獲取所有 Transactions 資料
app.get('/', function (req, res) {
    let SQL = "SELECT transaction_id, seller_id, buyer_id, product_id, price, status FROM Transactions ORDER BY transaction_id";
    doSQL(SQL, [], res, function (data) {
        res.render('Transactions/index', {
            data: data,
            partials: { row: 'Transactions/row' },  // 這裡我們使用了 row.hjs 這個 partials 模板
        });
    });
});

// 更新 Transactions 的資料
app.put("/:transaction_id", function (req, res) {
    let showRow = function () {
        let SQL = "SELECT transaction_id, seller_id, buyer_id, product_id, price, status FROM Transactions WHERE transaction_id = ?";
        doSQL(SQL, [req.params.transaction_id], res, function (data) {
            res.render('Transactions/row', {
                transaction_id: data[0].transaction_id,
                seller_id: data[0].seller_id,
                buyer_id: data[0].buyer_id,
                product_id: data[0].product_id,
                price: data[0].price,
                status: data[0].status
            });
        });
    };

    if (req.body.action === "update") {
        let SQL = "UPDATE Transactions SET seller_id = ?, buyer_id = ?, product_id = ?, price = ?, status = ? WHERE transaction_id = ?";
        doSQL(SQL, [req.body.seller_id, req.body.buyer_id, req.body.product_id, req.body.price, req.body.status, req.params.transaction_id], res, function () {
            showRow();
        });
    } else {
        showRow();
    }
});

module.exports = app;
