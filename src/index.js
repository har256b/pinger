const express = require('express');
const axios = require('axios');
const Redis = require('ioredis');
const winston = require('winston');
const os = require('os')

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to Redis
const redis = new Redis({
  host: process.env.REDIS_HOST || 'redis-service',
  port: process.env.REDIS_PORT || 6379,
});

// Logging configuration
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

// Express route to ping a URL and save data
app.get('/ping', async (req, res) => {
  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  const startTime = Date.now();

  try {
    const response = await axios.get(url);
    const endTime = Date.now();
    const timeConsumed = endTime - startTime;

    // Save data to Redis
    await redis.zadd('pings', timeConsumed, JSON.stringify({
      url,
      timeConsumed,
      headers: response.headers,
    }));

    res.json({ debug: os.hostname(), message: 'Ping successful', timeConsumed, headers: response.headers });
  } catch (error) {
    res.status(500).json({ error: 'Error pinging the URL' });
  }
});

// Start the server
app.listen(PORT, () => {
  logger.info(`Server is running on http://localhost:${PORT}`);
});
