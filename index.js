const path = require("path");
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const { createProxyMiddleware } = require('http-proxy-middleware');

const logger = morgan("tiny");

const app = express();
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cors());
app.use(logger);

app.use('/api1', createProxyMiddleware({
  target: "https://api.f2gpt.com/v1/chat/completions", // 目标API的URL
  changeOrigin: true, // 修改请求头的origin为目标API的origin
  pathRewrite: {
    '^/api1': '', // 去掉代理请求中的 `/api` 前缀
  },
  onProxyReq: (proxyReq, req, res) => {
    // 如果目标API需要API_KEY，可以在请求头中添加
    // if (process.env.OPENAI_API_KEY) {
      proxyReq.setHeader('Authorization', `Bearer ${process.env.MY_KEY}`);
      res.status(500).json({ error: 'Proxy error occurred' });
    // }
  },
  onError: (err, req, res) => {
    console.error('Proxy error:', err);
    res.status(500).json({ error: 'Proxy error occurred' });
  }
}));


// 首页
app.get("/", async (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// 小程序调用，获取微信 Open ID
app.get("/api/wx_openid", async (req, res) => {
  if (req.headers["x-wx-source"]) {
    res.send(req.headers["x-wx-openid"]);
  }
});

const port = process.env.PORT || 80;

async function bootstrap() {
  // await initDB();
  app.listen(port, () => {
    console.log("启动成功", port);
  });
}

bootstrap();
