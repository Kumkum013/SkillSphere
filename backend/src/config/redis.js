const redis = require('redis');
const cacheMetrics = require('../services/cacheMetrics');

let redisClient;

const connectRedis = async () => {
  try {
    redisClient = redis.createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379',
      socket: {
        reconnectStrategy: (retries) => {
          if (retries > 3) {
            console.warn('⚠️  Redis unavailable: Continuing without caching.');
            return false; // Stop retrying after 3 failed attempts
          }
          return Math.min(retries * 500, 2000);
        }
      }
    });

    redisClient.on('error', (err) => {
      // Log concise warning instead of crashing
      if (err.code === 'ECONNREFUSED') {
        // Handled via reconnectStrategy warning
      } else {
        console.warn('Redis Client Warning:', err.message);
      }
    });

    redisClient.on('connect', () => {
      console.log('⚡ Redis connected successfully');
    });

    await redisClient.connect();
    return redisClient;
  } catch (error) {
    console.warn('⚠️  Redis connection failed (Caching disabled, DB will handle requests directly).');
    return null;
  }
};

const getRedisClient = () => {
  return redisClient;
};

const cacheGet = async (key) => {
  const startTime = Date.now();
  try {
    if (!redisClient || !redisClient.isOpen) {
      cacheMetrics.recordMiss(key);
      return null;
    }
    const data = await redisClient.get(key);
    const latencyMs = Date.now() - startTime;
    if (data === null) {
      cacheMetrics.recordMiss(key, latencyMs);
      return null;
    }

    const value = JSON.parse(data);
    cacheMetrics.recordHit(key, latencyMs);
    return value;
  } catch (error) {
    cacheMetrics.recordError(error, key);
    cacheMetrics.recordMiss(key, Date.now() - startTime);
    console.error('Redis GET error:', error);
    return null;
  }
};

const cacheSet = async (key, value, ttl = 3600) => {
  const startTime = Date.now();
  try {
    if (!redisClient || !redisClient.isOpen) {
      return false;
    }
    await redisClient.setEx(key, ttl, JSON.stringify(value));
    cacheMetrics.recordSet(key, Date.now() - startTime);
    return true;
  } catch (error) {
    cacheMetrics.recordError(error, key);
    console.error('Redis SET error:', error);
    return false;
  }
};

const cacheDel = async (key) => {
  try {
    if (!redisClient || !redisClient.isOpen) {
      return false;
    }
    await redisClient.del(key);
    cacheMetrics.recordDelete(key);
    return true;
  } catch (error) {
    cacheMetrics.recordError(error, key);
    console.error('Redis DEL error:', error);
    return false;
  }
};

const cacheDelPattern = async (pattern) => {
  try {
    if (!redisClient || !redisClient.isOpen) {
      return false;
    }
    const keys = await redisClient.keys(pattern);
    if (keys.length > 0) {
      await redisClient.del(keys);
      cacheMetrics.recordDelete(pattern, keys.length);
    }
    return true;
  } catch (error) {
    cacheMetrics.recordError(error, pattern);
    console.error('Redis DEL pattern error:', error);
    return false;
  }
};

module.exports = {
  connectRedis,
  getRedisClient,
  cacheGet,
  cacheSet,
  cacheDel,
  cacheDelPattern
};
