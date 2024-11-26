const express = require('express');
const app = express.Router();

function doSQL(SQL, parms, res, callback) {
    app.connection.execute(SQL, parms, function (err, data) {
        if (err) {
            console.log(err);
            res.status(404).send(err.sqlMessage);
        }
        else {
            callback(data);
        }
    });
}

// 獲取所有 Categories 資料
app.get('/', function (req, res) {
    let SQL = "SELECT category_id, description FROM Categories ORDER BY category_id";
    doSQL(SQL, [], res, function (data) {
        res.render('Categories/index', {
            data: data,
            partials: { row: 'Categories/row' },    // 這裡我們使用了 row.hjs 這個 partials 模板
        });
    });
});

// 更新 Categories 的 description 欄位
app.put("/:category_id", function (req, res) {
    let showRow = function () {
        let SQL = "SELECT category_id, description FROM Categories WHERE category_id = ?";
        doSQL(SQL, [req.params.category_id], res, function (data) {
            res.render('Categories/row', {
                category_id: data[0].category_id,
                description: data[0].description
            });
        });
    };

    if (req.body.action === "update") {
        let SQL = "UPDATE Categories SET description = ? WHERE category_id = ?";
        doSQL(SQL, [req.body.description, req.params.category_id], res, function () {
            showRow();
        });
    } else {
        showRow();
    }
});

module.exports = app;
