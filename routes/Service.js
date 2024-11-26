const express = require('express');
const app = express.Router();

function doSQL(SQL, parms, res, callback) {
    console.log('Executing SQL:', SQL);
    console.log('With parameters:', parms);
    app.connection.execute(SQL, parms, function (err, data) {
        if (err) {
            console.log(err);
            res.status(404).send(err.sqlMessage);
        } else {
            callback(data);
        }
    });
}

// 獲取所有 Driver 資料
app.get('/', function (req, res) {
    let SQL = "SELECT user_id, first_name, last_name, email, description FROM Driver ORDER BY user_id";
    doSQL(SQL, [], res, function (data) {
        res.render('Service/index', {
            data: data,
            partials: { row: 'Service/row' },
        });
    });
});

// 獲取特定 Driver 資料並顯示編輯頁面
app.get('/edit/:user_id', function (req, res) {
    const user_id = req.params.user_id;
    let SQL = "SELECT user_id, first_name, last_name, email, description FROM Driver WHERE user_id = ?";
    doSQL(SQL, [user_id], res, function (data) {
        res.render('Service/edit', {
            driver: data[0]
        });
    });
});

// 更新 Driver 的資料
app.post('/edit/:user_id', function (req, res) {
    const user_id = req.params.user_id;
    const { first_name, last_name, email, description } = req.body;

    // 檢查參數是否定義
    if (!first_name || !last_name || !email) {
        return res.status(400).send("First name, last name, and email are required.");
    }

    let SQL = "UPDATE Driver SET first_name = ?, last_name = ?, email = ?, description = ? WHERE user_id = ?";
    doSQL(SQL, [first_name, last_name, email, description || null, user_id], res, function () {
        res.redirect('/Service');
    });
});

// 添加新的 Driver
app.post('/add', function (req, res) {
    const { user_id, first_name, last_name, email, description } = req.body;

    // 檢查參數是否定義
    if (!user_id || !first_name || !last_name || !email) {
        return res.status(400).send("User ID, First name, last name, and email are required.");
    }

    // 查詢 Users 表，確認 user_id 是否存在
    let SQL = "SELECT user_id FROM Users WHERE user_id = ?";
    doSQL(SQL, [user_id], res, function (data) {
        if (data.length === 0) {
            // 如果 user_id 不存在，先插入到 Users 表
            let insertSQL = "INSERT INTO Users (user_id) VALUES (?)";
            doSQL(insertSQL, [user_id], res, function () {
                // 插入到 Users 表後，再插入到 Driver 表
                let driverSQL = "INSERT INTO Driver (user_id, first_name, last_name, email, description) VALUES (?, ?, ?, ?, ?)";
                doSQL(driverSQL, [user_id, first_name, last_name, email, description || null], res, function () {
                    res.redirect('/Service');
                });
            });
        } else {
            // 如果 user_id 已存在，直接插入到 Driver 表
            let driverSQL = "INSERT INTO Driver (user_id, first_name, last_name, email, description) VALUES (?, ?, ?, ?, ?)";
            doSQL(driverSQL, [user_id, first_name, last_name, email, description || null], res, function () {
                res.redirect('/Service');
            });
        }
    });
});

// 刪除 Driver
app.post('/delete/:user_id', function (req, res) {
    const user_id = req.params.user_id;

    if (!user_id) {
        return res.status(400).send("User ID is required.");
    }

    let SQL = "DELETE FROM Driver WHERE user_id = ?";
    doSQL(SQL, [user_id], res, function (data) {
        res.redirect('/Service');
    });
});

module.exports = app;
