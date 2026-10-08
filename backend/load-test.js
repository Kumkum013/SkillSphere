/**
 * SkillSphere Load Testing Script
 * Simulates high concurrent traffic to benchmark API performance, database indexing, and Redis caching.
 *
 * Usage:
 *   node load-test.js
 *   node load-test.js --concurrency 20 --requests 200
 */

const http = require('http');

const parseArgs = () => {
  const args = process.argv.slice(2);
  let concurrency = 15;
  let totalRequests = 100;
  let targetPath = '/';

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--concurrency' && args[i + 1]) concurrency = parseInt(args[i + 1]);
    if (args[i] === '--requests' && args[i + 1]) totalRequests = parseInt(args[i + 1]);
    if (args[i] === '--path' && args[i + 1]) targetPath = args[i + 1];
  }

  return { concurrency, totalRequests, targetPath };
};

const makeRequest = (path) => {
  return new Promise((resolve) => {
    const start = process.hrtime();
    const req = http.get(
      {
        hostname: 'localhost',
        port: 5000,
        path: path,
        timeout: 5000
      },
      (res) => {
        let body = '';
        res.on('data', (chunk) => {
          body += chunk;
        });
        res.on('end', () => {
          const diff = process.hrtime(start);
          const latencyMs = (diff[0] * 1e3 + diff[1] * 1e-6);
          const cacheHeader = res.headers['x-cache'] || 'N/A';
          resolve({
            statusCode: res.statusCode,
            latencyMs,
            cacheHeader,
            success: res.statusCode >= 200 && res.statusCode < 300,
            rateLimited: res.statusCode === 429
          });
        });
      }
    );

    req.on('error', (err) => {
      const diff = process.hrtime(start);
      resolve({
        statusCode: 0,
        latencyMs: (diff[0] * 1e3 + diff[1] * 1e-6),
        cacheHeader: 'ERROR',
        success: false,
        error: err.message
      });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({
        statusCode: 408,
        latencyMs: 5000,
        cacheHeader: 'TIMEOUT',
        success: false,
        error: 'Timeout'
      });
    });
  });
};

const runBenchmark = async () => {
  const { concurrency, totalRequests, targetPath } = parseArgs();

  console.log('====================================================');
  console.log('🚀 SkillSphere Load Testing Benchmark');
  console.log('====================================================');
  console.log(`Target:       http://localhost:5000${targetPath}`);
  console.log(`Requests:     ${totalRequests}`);
  console.log(`Concurrency:  ${concurrency}`);
  console.log('Starting test...\n');

  const results = [];
  let completed = 0;
  const startTime = Date.now();

  const worker = async () => {
    while (completed < totalRequests) {
      completed++;
      const res = await makeRequest(targetPath);
      results.push(res);
      process.stdout.write(`\rProgress: ${results.length}/${totalRequests} requests completed`);
    }
  };

  const pool = Array.from({ length: concurrency }, () => worker());
  await Promise.all(pool);

  const totalTimeSeconds = (Date.now() - startTime) / 1000;
  const latencies = results.map((r) => r.latencyMs).sort((a, b) => a - b);
  const successCount = results.filter((r) => r.success).length;
  const rateLimitedCount = results.filter((r) => r.rateLimited).length;
  const errorCount = results.filter((r) => !r.success && !r.rateLimited).length;

  const avgLatency = latencies.reduce((sum, val) => sum + val, 0) / (latencies.length || 1);
  const p50 = latencies[Math.floor(latencies.length * 0.5)] || 0;
  const p95 = latencies[Math.floor(latencies.length * 0.95)] || 0;
  const p99 = latencies[Math.floor(latencies.length * 0.99)] || 0;
  const rps = totalRequests / (totalTimeSeconds || 1);

  const cacheHits = results.filter((r) => r.cacheHeader === 'HIT').length;
  const cacheMisses = results.filter((r) => r.cacheHeader === 'MISS').length;

  console.log('\n\n====================================================');
  console.log('📊 Benchmark Results Summary');
  console.log('====================================================');
  console.log(`Total Duration:       ${totalTimeSeconds.toFixed(2)}s`);
  console.log(`Throughput:           ${rps.toFixed(2)} req/sec`);
  console.log(`Successful (2xx):     ${successCount}`);
  console.log(`Rate Limited (429):   ${rateLimitedCount}`);
  console.log(`Errors / Timeouts:    ${errorCount}`);
  console.log('----------------------------------------------------');
  console.log(`Avg Latency:          ${avgLatency.toFixed(2)} ms`);
  console.log(`Min Latency:          ${(latencies[0] || 0).toFixed(2)} ms`);
  console.log(`50th Percentile (p50): ${p50.toFixed(2)} ms`);
  console.log(`95th Percentile (p95): ${p95.toFixed(2)} ms`);
  console.log(`Max Latency:          ${(latencies[latencies.length - 1] || 0).toFixed(2)} ms`);
  if (cacheHits > 0 || cacheMisses > 0) {
    console.log('----------------------------------------------------');
    console.log(`Cache Hits (⚡ RAM):   ${cacheHits}`);
    console.log(`Cache Misses (DB):    ${cacheMisses}`);
    console.log(`Cache Hit Ratio:      ${((cacheHits / (cacheHits + cacheMisses)) * 100).toFixed(1)}%`);
  }
  console.log('====================================================\n');
};

runBenchmark().catch((err) => console.error('Benchmark failed:', err));
