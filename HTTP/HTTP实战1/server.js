// 引入Express框架 - Express是一个基于Node.js的Web应用框架，简化了HTTP服务器的创建和管理
const express = require('express');
// 引入body-parser中间件 - 用于解析HTTP请求体，支持JSON和URL编码格式
const bodyParser = require('body-parser');
// 引入cookie-parser中间件 - 用于解析HTTP请求中的Cookie信息
const cookieParser = require('cookie-parser');
// 创建Express应用实例 - 这是HTTP服务器的核心对象
const app = express();
// 设置服务器监听端口 - TCP/IP协议中的端口号，用于标识特定的应用程序
const port = 3000;

// 注册中间件：解析JSON格式的请求体
app.use(bodyParser.json());
// 注册中间件：解析URL编码格式的请求体，extended:true支持复杂嵌套对象
app.use(bodyParser.urlencoded({ extended: true }));
// 注册中间件：解析Cookie，使req.cookies可以访问Cookie数据
app.use(cookieParser());
// 注册中间件：提供静态文件服务，将当前目录作为静态文件根目录
app.use(express.static(__dirname));

// ========================== HTTP方法与内容协商演示 ==========================
// 定义GET请求处理 - GET是HTTP协议中最常用的请求方法，用于获取资源
// URL路径：/api/.data（注意：这里有个错误，路径中多了个点，应该是/api/data）
app.get('/api/data', (req, res) => {
    // 获取HTTP请求头中的Accept字段 - Accept头用于内容协商，指定客户端能接受的数据格式
    const acceptHeader = req.headers.accept || '';
    
    // 内容协商演示：根据客户端请求的Accept头返回不同格式的数据
    if (acceptHeader.includes('application/json')) {
        // 返回JSON格式响应 - HTTP状态码200表示成功
        res.status(200).json({
            message: 'Get请求成功（JSON格式）',
            data: { username: 'demo-user', timestamp: new Date().toLocaleString() },
            requestMethod: req.method, // 请求方法（GET）
            requestUrl: req.originalUrl // 请求URL（注意：这里有个拼写错误，应该是originalUrl）
        });
    } else if (acceptHeader.includes('text/html')) {
        // 返回HTML格式响应 - 通过header方法设置Content-Type响应头
        res.status(200).header('Content-Type', 'text/html').send(`
            <h3>GET请求成功（HTML格式）</h3>
            <p>请求方法：${req.method}</p>
            <p>请求URL：${req.originalUrl}</p>
            <p>时间戳：${new Date().toLocaleString()}</p>
            `);
    } else {
        // HTTP状态码406表示"不接受" - 客户端请求的格式服务器无法提供
        res.status(406).send('不支持的响应格式，请在请求头Accept中指定application/json或text/html');
    }
});

// ========================== POST请求与请求体处理 ==========================
// 定义POST请求处理 - POST常用于提交数据到服务器
app.post('/api/submit', (req, res) => {
    // 从请求体中解构出username和message参数 - body-parser中间件已解析请求体
    const { username, message } = req.body;
    
    // 参数验证：如果缺少必要参数，返回400错误（请求错误）
    if (!username || !message) {
        return res.status(400).json({ error: '参数为空：需要提供username和message' });
    }

    // 成功处理请求，返回200状态码和处理结果
    // 注意：这里有个错误，响应中包含了未定义的password变量
    res.status(200).json({
        success: true,
        message: 'POST数据提交成功',
        receiveData: { username, message },
        requestMethod: req.method
    });
});

// ========================== HTTP状态码演示 ==========================
// 404状态码演示 - 表示请求的资源不存在
app.get('/api/not-found', (req, res) => {
    res.status(404).json({
        error: '404 Not Found',
        message: '请求的资源不存在（演示404状态码）'
    });
});

// 500状态码演示 - 表示服务器内部错误
app.get('/api/server-error', (req, res) => {
    try {
        // 模拟服务器内部错误，如数据库连接失败
        throw new Error('模拟数据库连接失败');
    } catch (err) {
        res.status(500).json({
            error: '500 Internal Server Error',
            message: '服务器内部错误（演示500状态码）',
            detail: err.message
        });
    }
});

// 302重定向演示 - 表示临时重定向到另一个URL
app.get('/api/redirect', (req, res) => {
    // HTTP 302状态码表示临时重定向，redirect方法自动设置Location响应头
    res.status(302).redirect('/');
});

// ========================== Cookie与状态管理演示 ==========================
// 登录接口演示 - 展示如何使用Cookie维持HTTP会话状态
app.post('/api/login', (req, res) => {
    const { username } = req.body;
    if (!username) {
        return res.status(400).json({ error: '参数为空：需要提供username' });
    }
    
    // 设置Cookie - 这是HTTP无状态协议下维持状态的常用方式
    // maxAge设置Cookie有效期为1小时，httpOnly设为true增强安全性
    res.cookie('username', username, { maxAge: 3600000, httpOnly: true });
    
    res.status(200).json({
        success: true,
        message: `登录成功！欢迎${username}`,
        tip: 'Cookie已设置，有效期1小时，后续请求会携带Cookie维持状态'
    });
});

// 用户信息接口 - 展示如何通过Cookie识别用户身份
app.get('/api/user', (req, res) => {
    // 从请求中获取Cookie - cookie-parser中间件已解析Cookie
    const { username } = req.cookies;
    
    if (username) {
        // 已登录状态 - HTTP本身无状态，通过Cookie实现了状态管理
        res.status(200).json({
            isLogin: true,
            username,
            message: 'HTTP本身无状态，通过Cookie维持了登录状态'
        });
    } else {
        // 未登录状态 - 401表示未授权
        res.status(401).json({
            isLogin: false,
            error: '401 Unauthorized',
            message: '未登录或登录状态已过期'
        });
    }
});

// ========================== 启动HTTP服务器 ==========================
// 启动HTTP服务器并监听指定端口
// Express应用在底层会创建TCP/IP服务器，监听3000端口的HTTP请求
app.listen(port, () => {
    console.log(`HTTP Demo服务已启动：http://localhost:${port}`);
    console.log('核心功能：');
    console.log('1. GET /api/data → 演示GET方法、内容协商');
    console.log('2. POST /api/submit → 演示POST方法、请求体处理');
    console.log('3. /api/not-found → 演示404状态码');
    console.log('4. /api/server-error → 演示500状态码');
    console.log('5. /api/redirect → 演示302重定向');
    console.log('6. /api/login + /api/user → 演示Cookie维持状态');
});