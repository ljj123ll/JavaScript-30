// 引入Express框架
const express = require('express');
// 创建Express应用实例
const app = express();
// 设置服务器监听端口
const port = 3000;

// 定义根路由的处理函数
// 当用户访问网站根路径('/')时，服务器返回'Hello World!'
app.get('/',(req, res) => {
    res.send('Hello World!');
});

// 启动服务器并监听指定端口
// 服务器启动后，在控制台输出访问地址
app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});