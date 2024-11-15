const path = require("path");
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const fetch = require("node-fetch");
const logger = morgan("tiny");
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cors());
app.use(logger);

const key = 'sk-f2WN7h04QbO5cTCIRbzhNapSrHLmxqUwxh9xMGKgVOrb2pVN'

app.post('/proxy-reply', async (req, res) => {
  const userInput = req.body.input;
  const isStream = req.body.isStream;
  
  try {
    const response = await fetch('http://47.115.150.165/lanxi/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${key}`
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        temperature: 0.7,
        stream: isStream || false,
        messages: [
          {
            role: "user",
            content: userInput
          }
        ]
      })
    });

    if (isStream) {
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      response.body.on('data', (chunk) => {
        res.write(chunk); // 逐块写入响应
      });

      response.body.on('end', () => {
        res.end(); // 流结束时关闭响应
      });

      response.body.on('error', (error) => {
        res.status(500).json({ error: error.message });
      });
    } else {
      // 如果不使用流，则直接返回 JSON 数据
      const data = await response.json();
      res.json(data);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


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
