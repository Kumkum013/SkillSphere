/**
 * SkillSphere load test and stepped capacity benchmark.
 *
 * Examples:
 *   npm run loadtest -- --path /
 *   npm run loadtest -- --url http://localhost:5000 --path /api/projects --token <JWT>
 *   npm run loadtest -- --capacity --path / --max-concurrency 100 --step 10
 */

const http = require('http');
const https = require('https');

const parseArgs = (args = process.argv.slice(2)) => {
  const options = {
    url: process.env.API_URL || 'http://localhost:5000',
    path: '/',
    token: process.env.LOAD_TEST_TOKEN || '',
    concurrency: 15,
    totalRequests: 100,
    timeoutMs: 5000,
    capacity: false,
    maxConcurrency: 100,
    step: 10,
    requestsPerStep: 100,
    maxP95Ms: 1000,
    maxErrorRate: 1
  };

  const values = {
    '--url': 'url',
    '--path': 'path',
    '--token': 'token',
    '--concurrency': 'concurrency',
    '--requests': 'totalRequests',
    '--timeout': 'timeoutMs',
    '--max-concurrency': 'maxConcurrency',
    '--step': 'step',
    '--requests-per-step': 'requestsPerStep',
    '--max-p95-ms': 'maxP95Ms',
    '--max-error-rate': 'maxErrorRate'
  };

  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];
    if (arg === '--capacity') {
      options.capacity = true;
      continue;
    }

    const option = values[arg];
    if (!option || args[i + 1] === undefined || args[i + 1].startsWith('--')) {
      throw new Error(`Unknown option or missing value: ${arg}`);
    }
    options[option] = args[i + 1];
    i += 1;
  }

  for (const key of [
    'concurrency',
    'totalRequests',
    'timeoutMs',
    'maxConcurrency',
    'step',
    'requestsPerStep',
    'maxP95Ms'
  ]) {
    options[key] = Number(options[key]);
    if (!Number.isInteger(options[key]) || options[key] < 1) {
      throw new Error(`--${key} must be a positive integer`);
    }
  }

  options.maxErrorRate = Number(options.maxErrorRate);
  if (!Number.isFinite(options.maxErrorRate) || options.maxErrorRate < 0 || options.maxErrorRate > 100) {
    throw new Error('--max-error-rate must be a percentage from 0 to 100');
  }

  try {
    const target = new URL(options.url);
    if (!['http:', 'https:'].includes(target.protocol)) {
      throw new Error();
    }
    options.url = target.origin;
  } catch {
    throw new Error('--url must be a valid http or https URL');
  }

  if (!options.path.startsWith('/')) {
    throw new Error('--path must start with /');
  }

  return options;
};

const makeRequest = (targetUrl, path, token, timeoutMs) => new Promise((resolve) => {
  const url = new URL(path, targetUrl);
  const transport = url.protocol === 'https:' ? https : http;
  const start = process.hrtime.bigint();
  let settled = false;

  const finish = (result) => {
    if (settled) return;
    settled = true;
    const latencyMs = Number(process.hrtime.bigint() - start) / 1e6;
    resolve({ ...result, latencyMs });
  };

  const request = transport.get(url, {
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  }, (response) => {
    response.resume();
    response.on('end', () => {
      finish({
        statusCode: response.statusCode || 0,
        cacheHeader: response.headers['x-cache'] || 'N/A'
      });
    });
  });

  request.setTimeout(timeoutMs, () => {
    request.destroy(new Error('Request timed out'));
  });
  request.on('error', (error) => {
    finish({
      statusCode: 0,
      cacheHeader: 'ERROR',
      error: error.message
    });
  });
});

const percentile = (sortedValues, fraction) => {
  if (sortedValues.length === 0) return 0;
  return sortedValues[Math.ceil(sortedValues.length * fraction) - 1];
};

const runLoadLevel = async (options, concurrency, totalRequests) => {
  const results = [];
  let nextRequest = 0;
  const startTime = process.hrtime.bigint();

  const worker = async () => {
    while (true) {
      const requestIndex = nextRequest;
      nextRequest += 1;
      if (requestIndex >= totalRequests) return;
      results.push(await makeRequest(options.url, options.path, options.token, options.timeoutMs));
    }
  };

  await Promise.all(Array.from({ length: Math.min(concurrency, totalRequests) }, () => worker()));

  const durationSeconds = Number(process.hrtime.bigint() - startTime) / 1e9;
  const latencies = results.map((result) => result.latencyMs).sort((a, b) => a - b);
  const successful = results.filter((result) => result.statusCode >= 200 && result.statusCode < 300).length;
  const rateLimited = results.filter((result) => result.statusCode === 429).length;
  const failures = results.length - successful;
  const cacheHits = results.filter((result) => result.cacheHeader === 'HIT').length;
  const cacheMisses = results.filter((result) => result.cacheHeader === 'MISS').length;

  return {
    concurrency,
    totalRequests: results.length,
    durationSeconds,
    requestsPerSecond: results.length / (durationSeconds || 1),
    successful,
    failures,
    rateLimited,
    errorRate: results.length === 0 ? 100 : (failures / results.length) * 100,
    averageLatencyMs: latencies.reduce((sum, latency) => sum + latency, 0) / (latencies.length || 1),
    p50Ms: percentile(latencies, 0.5),
    p95Ms: percentile(latencies, 0.95),
    p99Ms: percentile(latencies, 0.99),
    maxLatencyMs: latencies[latencies.length - 1] || 0,
    cacheHits,
    cacheMisses
  };
};

const printResults = (result) => {
  console.log(`Concurrency:          ${result.concurrency}`);
  console.log(`Requests:             ${result.totalRequests}`);
  console.log(`Duration:             ${result.durationSeconds.toFixed(2)}s`);
  console.log(`Throughput:           ${result.requestsPerSecond.toFixed(2)} req/sec`);
  console.log(`Successful (2xx):     ${result.successful}`);
  console.log(`Failed:               ${result.failures}`);
  console.log(`Rate limited (429):   ${result.rateLimited}`);
  console.log(`Error rate:           ${result.errorRate.toFixed(2)}%`);
  console.log(`Average latency:      ${result.averageLatencyMs.toFixed(2)} ms`);
  console.log(`p50 / p95 / p99:      ${result.p50Ms.toFixed(2)} / ${result.p95Ms.toFixed(2)} / ${result.p99Ms.toFixed(2)} ms`);
  console.log(`Max latency:          ${result.maxLatencyMs.toFixed(2)} ms`);
  if (result.cacheHits > 0 || result.cacheMisses > 0) {
    console.log(`Cache hit rate:       ${((result.cacheHits / (result.cacheHits + result.cacheMisses)) * 100).toFixed(2)}%`);
  }
};

const runBenchmark = async (options) => {
  console.log('SkillSphere Load Testing Benchmark');
  console.log(`Target: ${options.url}${options.path}`);
  printResults(await runLoadLevel(options, options.concurrency, options.totalRequests));
};

const runCapacityTest = async (options) => {
  let highestSustainable = null;
  console.log('SkillSphere Stepped Capacity Benchmark');
  console.log(`Target: ${options.url}${options.path}`);
  console.log(`Limits: p95 <= ${options.maxP95Ms} ms; errors <= ${options.maxErrorRate}%`);

  for (let concurrency = Math.min(options.step, options.maxConcurrency); ; concurrency = Math.min(concurrency + options.step, options.maxConcurrency)) {
    const result = await runLoadLevel(options, concurrency, options.requestsPerStep);
    console.log(`\n--- ${concurrency} concurrent requests ---`);
    printResults(result);

    if (result.p95Ms > options.maxP95Ms || result.errorRate > options.maxErrorRate) {
      console.log('\nSustainability threshold exceeded; stopping the ramp.');
      break;
    }
    highestSustainable = result;
    if (concurrency === options.maxConcurrency) break;
  }

  console.log('\nCapacity estimate from this test run:');
  if (!highestSustainable) {
    console.log('No tested load level met the configured thresholds.');
    return;
  }

  console.log(`Highest passing concurrency: ${highestSustainable.concurrency}`);
  console.log(`Observed throughput at that level: ${highestSustainable.requestsPerSecond.toFixed(2)} req/sec`);
  console.log(`Observed p95 latency: ${highestSustainable.p95Ms.toFixed(2)} ms`);
  console.log(`Observed error rate: ${highestSustainable.errorRate.toFixed(2)}%`);
  console.log('This is an estimate for this host, endpoint, data, and test duration—not a production capacity guarantee.');
};

if (require.main === module) {
  try {
    const options = parseArgs();
    (options.capacity ? runCapacityTest(options) : runBenchmark(options))
      .catch((error) => {
        console.error('Load test failed:', error.message);
        process.exitCode = 1;
      });
  } catch (error) {
    console.error(`Invalid load-test options: ${error.message}`);
    process.exitCode = 1;
  }
}

module.exports = { parseArgs, makeRequest, runLoadLevel };
