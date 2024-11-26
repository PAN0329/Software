//引入模組
const express = require('express');
const cookieParser = require('cookie-parser');
const app = express.Router();

// 使用 cookie-parser 中介軟體來解析請求中的 Cookie
// 'secretingredient' 是用於簽署和驗證簽名 Cookie 的秘密金鑰
// 解析的未簽名 Cookie 會存放在 req.cookies
// 已簽名且驗證通過的 Cookie 會存放在 req.signedCookies
app.use(cookieParser('secretingredient'));



// 定義 POST 請求的路由來處理用戶登入
app.post('/', function (req, res) {
    // 從請求的 body 中提取用戶名和密碼
    const { username, password } = req.body;

    // 驗證用戶名和密碼
    if (username !== 'admin' || password !== '1234') {
        // 登入失敗：清除登入狀態的相關 Cookie
        res.clearCookie('loggedIn', { path: '/' });
        res.clearCookie('username', { path: '/' });
        
        // 設置閃存 Cookie 提示登入失敗，並重定向到登入頁面
        res.cookie('flash', "Login failure!", { signed: true, maxAge: 10000 });
        res.redirect('/login/index');
    } else {
        // 登入成功：設置登入狀態的 Cookie
        const options = { signed: true, maxAge: 900000, httpOnly: true, path: '/' };
        res.cookie('loggedIn', true, options);
        res.cookie('username', username, options);
        
        // 設置閃存 Cookie 提示登入成功，並重定向到主頁
        res.cookie('flash', "You are now logged in!", { signed: true, maxAge: 10000 });
        res.redirect('/');
    }
});


app.post('/logout', function (req, res) {
     // 清除登入狀態的相關 Cookie
    res.clearCookie('loggedIn', { path: '/' });
    res.clearCookie('username', { path: '/' });

    // 設置閃存 Cookie，提示用戶已成功登出，有效期 10 秒
    res.cookie('flash', "You have logged out!", { signed: true, maxAge: 10000 });
    // 將用戶重定向到主頁
    res.redirect('/');
});

app.get('/index', function (req, res) {
    // 從簽名的 Cookie 中提取閃存提示訊息
    const flashMessage = req.signedCookies.flash;

    // 確定用戶的登入狀態，'true' 表示已登入
    const loggedIn = req.signedCookies.loggedIn === 'true';

    // 渲染 login/index 頁面，將閃存訊息和登入狀態傳遞給模板
    res.render('login/index', { flashMessage, loggedIn });
});


module.exports = app;