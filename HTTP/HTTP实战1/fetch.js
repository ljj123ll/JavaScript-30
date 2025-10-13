// 工具函数：格式化响应头（获取Content-Type）
function getContentType(headers) {
  return headers.get('content-type') || '未知';
}

// 工具函数：显示响应结果到页面
function showResponse(status, contentType, body) {
  document.getElementById('status-code').textContent = status;
  document.getElementById('content-type').textContent = contentType;
  // 格式化JSON响应体，方便阅读
  const formattedBody = typeof body === 'object' ? JSON.stringify(body, null, 2) : body;
  document.getElementById('response-body').textContent = formattedBody;
}

// 1. 发送GET请求（支持内容协商：指定Accept头）
function sendGetRequest(acceptType) {
  fetch('/api/data', {
    method: 'GET',
    headers: {
      'Accept': acceptType, // 内容协商：指定期望的响应格式
      'Content-Type': 'application/json'
    }
  })
  .then(response => {
    const status = response.status;
    const contentType = getContentType(response.headers);
    // 根据响应格式解析数据（JSON或文本）
    const parsePromise = acceptType.includes('application/json') ? response.json() : response.text();
    return parsePromise.then(body => ({ status, contentType, body }));
  })
  .then(({ status, contentType, body }) => {
    showResponse(status, contentType, body);
  })
  .catch(err => {
    showResponse('错误', '未知', `请求失败：${err.message}`);
  });
}

// 2. 发送POST请求（提交表单数据）
function sendPostRequest() {
  const username = document.getElementById('post-username').value;
  const message = document.getElementById('post-message').value;
  
  fetch('/api/submit', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json', // 告诉服务器请求体是JSON格式
      'Accept': 'application/json'
    },
    body: JSON.stringify({ username, message }) // 请求体（JSON格式）
  })
  .then(response => {
    return response.json().then(body => ({
      status: response.status,
      contentType: getContentType(response.headers),
      body
    }));
  })
  .then(({ status, contentType, body }) => {
    showResponse(status, contentType, body);
    // 清空输入框
    document.getElementById('post-username').value = '';
    document.getElementById('post-message').value = '';
  })
  .catch(err => {
    showResponse('错误', '未知', `请求失败：${err.message}`);
  });
}

// 3. 发送通用请求（用于状态码演示）
function sendRequest(url) {
  fetch(url, { method: 'GET' })
  .then(response => {
    // 处理302重定向（fetch会自动跟随重定向，这里捕获最终响应）
    const status = response.status;
    const contentType = getContentType(response.headers);
    // 创建响应副本，确保可以多次尝试解析
    const clonedResponse = response.clone();
    
    return clonedResponse.json()
      .then(body => ({ status, contentType, body }))
      .catch(() => response.text()
        .then(body => ({ status, contentType, body }))
        .catch(() => ({ status, contentType, body: '无法解析响应体' }))
      );
  })
  .then(({ status, contentType, body }) => {
    showResponse(status, contentType, body);
  })
  .catch(err => {
    showResponse('错误', '未知', `请求失败：${err.message}`);
  });
}

// 4. 登录（POST提交用户名，设置Cookie）
function login() {
  const username = document.getElementById('login-username').value;
  if (!username) {
    alert('请输入用户名');
    return;
  }

  fetch('/api/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify({ username })
  })
  .then(response => response.json())
  .then(body => {
    showResponse(200, 'application/json', body);
    document.getElementById('login-username').value = '';
  })
  .catch(err => {
    showResponse('错误', '未知', `登录失败：${err.message}`);
  });
}

// 5. 检查登录状态（GET请求，携带Cookie）
function getUserStatus() {
  fetch('/api/user', {
    method: 'GET',
    headers: { 'Accept': 'application/json' }
    // fetch默认会携带当前域名的Cookie，无需额外配置
  })
  .then(response => {
    return response.json().then(body => ({
      status: response.status,
      contentType: getContentType(response.headers),
      body
    }));
  })
  .then(({ status, contentType, body }) => {
    showResponse(status, contentType, body);
  })
  .catch(err => {
    showResponse('错误', '未知', `请求失败：${err.message}`);
  });
}