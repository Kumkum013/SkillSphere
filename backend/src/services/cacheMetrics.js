/**
 * Cache Metrics Service
 * Tracks application-level Redis cache hit rate, hits, misses, latency, and per-endpoint statistics.
 */

class CacheMetricsService {
  constructor() {
    this.startTime = Date.now();
    this.resetMetrics();
  }

  resetMetrics() {
    this.metrics = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
      errors: 0,
      totalLookups: 0
    };

    // Tracks hit/miss counts per route/key prefix (e.g., 'recommendations', 'project-recommendations')
    this.endpointStats = new Map();

    // Circular buffer for recent cache access events (last 50)
    this.recentEvents = [];
    this.maxRecentEvents = 50;
  }

  /**
   * Extract or normalize a key category / endpoint name
   */
  _extractCategory(key, endpointHint) {
    if (endpointHint) return endpointHint;
    if (!key) return 'general';
    const parts = key.split(':');
    return parts[0] || 'general';
  }

  /**
   * Record a cache HIT event
   */
  recordHit(key, latencyMs = 0, endpointHint = null) {
    this.metrics.hits += 1;
    this.metrics.totalLookups += 1;

    const category = this._extractCategory(key, endpointHint);
    this._updateEndpointStats(category, true, latencyMs);
    this._addEvent('HIT', key, category, latencyMs);
  }

  /**
   * Record a cache MISS event
   */
  recordMiss(key, latencyMs = 0, endpointHint = null) {
    this.metrics.misses += 1;
    this.metrics.totalLookups += 1;

    const category = this._extractCategory(key, endpointHint);
    this._updateEndpointStats(category, false, latencyMs);
    this._addEvent('MISS', key, category, latencyMs);
  }

  /**
   * Record a cache SET event
   */
  recordSet(key, latencyMs = 0) {
    this.metrics.sets += 1;
    const category = this._extractCategory(key);
    this._addEvent('SET', key, category, latencyMs);
  }

  /**
   * Record a cache DELETE event
   */
  recordDelete(key, count = 1) {
    this.metrics.deletes += count;
    const category = this._extractCategory(key);
    this._addEvent('DEL', key, category, 0);
  }

  /**
   * Record a cache/Redis ERROR event
   */
  recordError(error, key = null) {
    this.metrics.errors += 1;
    const category = this._extractCategory(key);
    this._addEvent('ERROR', key, category, 0, error?.message || String(error));
  }

  /**
   * Update category / endpoint specific metrics
   */
  _updateEndpointStats(category, isHit, latencyMs) {
    if (!this.endpointStats.has(category)) {
      this.endpointStats.set(category, {
        hits: 0,
        misses: 0,
        totalLookups: 0,
        totalLatencyMs: 0
      });
    }

    const stat = this.endpointStats.get(category);
    stat.totalLookups += 1;
    stat.totalLatencyMs += latencyMs;
    if (isHit) {
      stat.hits += 1;
    } else {
      stat.misses += 1;
    }
  }

  /**
   * Add to circular buffer of recent events
   */
  _addEvent(action, key, category, latencyMs, error = null) {
    const event = {
      timestamp: new Date().toISOString(),
      action,
      key: key || 'N/A',
      category,
      latencyMs: Number(latencyMs.toFixed(3)),
      error
    };

    this.recentEvents.unshift(event);
    if (this.recentEvents.length > this.maxRecentEvents) {
      this.recentEvents.pop();
    }
  }

  /**
   * Get the current hit rate as a number between 0 and 1
   */
  getHitRateRatio() {
    if (this.metrics.totalLookups === 0) return 0;
    return Number((this.metrics.hits / this.metrics.totalLookups).toFixed(4));
  }

  /**
   * Get formatted hit rate percentage string (e.g., "75.00%")
   */
  getHitRatePercent() {
    if (this.metrics.totalLookups === 0) return '0.00%';
    return `${((this.metrics.hits / this.metrics.totalLookups) * 100).toFixed(2)}%`;
  }

  /**
   * Get formatted miss rate percentage string
   */
  getMissRatePercent() {
    if (this.metrics.totalLookups === 0) return '0.00%';
    const missRatio = this.metrics.misses / this.metrics.totalLookups;
    return `${(missRatio * 100).toFixed(2)}%`;
  }

  /**
   * Get comprehensive metrics summary
   */
  getMetrics() {
    const uptimeSeconds = Math.floor((Date.now() - this.startTime) / 1000);
    const hitRateRatio = this.getHitRateRatio();
    const hitRate = this.getHitRatePercent();
    const missRate = this.getMissRatePercent();

    const byEndpoint = {};
    for (const [category, stat] of this.endpointStats.entries()) {
      const epHitRatio = stat.totalLookups === 0 ? 0 : stat.hits / stat.totalLookups;
      const avgLatencyMs = stat.totalLookups === 0 ? 0 : Number((stat.totalLatencyMs / stat.totalLookups).toFixed(3));
      byEndpoint[category] = {
        hits: stat.hits,
        misses: stat.misses,
        totalLookups: stat.totalLookups,
        hitRate: `${(epHitRatio * 100).toFixed(2)}%`,
        hitRateRatio: Number(epHitRatio.toFixed(4)),
        avgLatencyMs
      };
    }

    return {
      summary: {
        totalLookups: this.metrics.totalLookups,
        hits: this.metrics.hits,
        misses: this.metrics.misses,
        hitRate,
        hitRateRatio,
        missRate,
        sets: this.metrics.sets,
        deletes: this.metrics.deletes,
        errors: this.metrics.errors,
        uptimeSeconds
      },
      byEndpoint,
      recentActivity: [...this.recentEvents]
    };
  }
}

// Singleton instance
const cacheMetrics = new CacheMetricsService();

module.exports = cacheMetrics;
