# Carball Shadow Parser Analytics Queries

This document provides queries to analyze the dark launch of the carball parser running in shadow mode alongside the primary ballchasing parser.

## Analytics Data Structure

### Primary Parser (Ballchasing)
- **Metric Name**: `parseReplay`
- **Tags**: `taskId`, `hash`, `success`, `cached`, `parser`
- **Fields**: `getMs`, `parseMs`, `putMs`, `totalMs`, `replayKb`

### Shadow Parser (Carball)
- **Metric Name**: `parseReplay_shadowCarball`
- **Tags**: `hash`, `success`, `parser`, `mode`, `error`
- **Fields**: `parseMs`

---

## InfluxDB Queries (InfluxQL)

### 1. Shadow Parser Success Rate
```influxql
SELECT
  COUNT(*) as total_parses,
  SUM(success) as successful_parses,
  (SUM(success) / COUNT(*)) * 100 as success_rate_percent
FROM parseReplay_shadowCarball
WHERE time > now() - 24h
```

### 2. Performance Comparison (Parse Time)
```influxql
SELECT
  MEAN(parseMs) as avg_parse_time_ms
FROM parseReplay_shadowCarball
WHERE time > now() - 24h AND success = 'true'
GROUP BY time(1h)
```

Compare with primary parser:
```influxql
SELECT
  MEAN(parseMs) as ballchasing_avg_ms
FROM parseReplay
WHERE time > now() - 24h AND parser = 'ballchasing-with-carball-shadow'
GROUP BY time(1h)
```

### 3. Most Common Errors
```influxql
SELECT
  error,
  COUNT(*) as error_count
FROM parseReplay_shadowCarball
WHERE time > now() - 7d AND success = 'false'
GROUP BY error
ORDER BY error_count DESC
LIMIT 10
```

### 4. Failed Replay Analysis
```influxql
SELECT
  hash,
  error,
  time
FROM parseReplay_shadowCarball
WHERE time > now() - 24h AND success = 'false'
ORDER BY time DESC
```

### 5. Success Rate Over Time (1-hour windows)
```influxql
SELECT
  (SUM(success) / COUNT(*)) * 100 as success_rate_percent
FROM parseReplay_shadowCarball
WHERE time > now() - 7d
GROUP BY time(1h)
```

### 6. Performance Percentiles
```influxql
SELECT
  PERCENTILE(parseMs, 50) as p50_ms,
  PERCENTILE(parseMs, 95) as p95_ms,
  PERCENTILE(parseMs, 99) as p99_ms
FROM parseReplay_shadowCarball
WHERE time > now() - 24h AND success = 'true'
```

### 7. Compare Success Rates (Primary vs Shadow)
```influxql
SELECT
  MEAN(success) * 100 as primary_success_rate
FROM parseReplay
WHERE time > now() - 24h AND parser = 'ballchasing-with-carball-shadow'
```

```influxql
SELECT
  MEAN(success) * 100 as shadow_success_rate
FROM parseReplay_shadowCarball
WHERE time > now() - 24h
```

### 8. Replays That Failed Only in Shadow
```influxql
SELECT
  s.hash,
  s.error as shadow_error
FROM parseReplay_shadowCarball s
INNER JOIN parseReplay p ON s.hash = p.hash
WHERE
  s.time > now() - 24h
  AND s.success = 'false'
  AND p.success = 'true'
ORDER BY s.time DESC
LIMIT 20
```

---

## Prometheus Queries (PromQL)

### 1. Shadow Parser Success Rate (Last 24h)
```promql
(
  sum(increase(parseReplay_shadowCarball_success_total{success="true"}[24h]))
  /
  sum(increase(parseReplay_shadowCarball_total[24h]))
) * 100
```

### 2. Average Parse Time Over Time
```promql
rate(parseReplay_shadowCarball_parseMs_sum[5m])
/
rate(parseReplay_shadowCarball_parseMs_count[5m])
```

### 3. Parse Time Comparison (Primary vs Shadow)
```promql
# Shadow parser average parse time
avg(parseReplay_shadowCarball_parseMs{success="true"})

# Primary parser average parse time
avg(parseReplay_parseMs{parser="ballchasing-with-carball-shadow"})
```

### 4. Success Rate Trend (5-minute windows)
```promql
rate(parseReplay_shadowCarball_success_total{success="true"}[5m])
/
rate(parseReplay_shadowCarball_total[5m])
```

### 5. Error Rate
```promql
(
  sum(increase(parseReplay_shadowCarball_success_total{success="false"}[1h]))
  /
  sum(increase(parseReplay_shadowCarball_total[1h]))
) * 100
```

### 6. Parse Time Percentiles
```promql
# 95th percentile
histogram_quantile(0.95,
  rate(parseReplay_shadowCarball_parseMs_bucket[5m])
)

# 99th percentile
histogram_quantile(0.99,
  rate(parseReplay_shadowCarball_parseMs_bucket[5m])
)
```

### 7. Parse Count by Success Status
```promql
sum(increase(parseReplay_shadowCarball_total[24h])) by (success)
```

---

## Dashboard Recommendations

### Key Metrics to Monitor

1. **Success Rate Dashboard**
   - Shadow parser success rate (current + 7-day trend)
   - Primary parser success rate (for comparison)
   - Error count by type

2. **Performance Dashboard**
   - Average parse time: Primary vs Shadow
   - P50, P95, P99 parse times
   - Performance delta (carball - ballchasing)

3. **Error Analysis Dashboard**
   - Top 10 error messages
   - Failed replay hashes (for debugging)
   - Error rate trend over time

4. **Volume Dashboard**
   - Total parses per hour
   - Success/failure breakdown
   - Concurrent parsing load

### Alerts to Configure

```yaml
# Alert if shadow parser success rate drops below 90%
- alert: CarballShadowSuccessRateLow
  expr: |
    (
      sum(rate(parseReplay_shadowCarball_success_total{success="true"}[1h]))
      /
      sum(rate(parseReplay_shadowCarball_total[1h]))
    ) < 0.90
  for: 15m
  annotations:
    summary: "Carball shadow parser success rate below 90%"

# Alert if shadow parser is significantly slower than primary
- alert: CarballShadowSlowPerformance
  expr: |
    avg(parseReplay_shadowCarball_parseMs)
    >
    avg(parseReplay_parseMs{parser="ballchasing-with-carball-shadow"}) * 2
  for: 30m
  annotations:
    summary: "Carball shadow parser is 2x slower than primary"

# Alert if shadow parser error rate is high
- alert: CarballShadowHighErrorRate
  expr: |
    (
      sum(rate(parseReplay_shadowCarball_success_total{success="false"}[1h]))
      /
      sum(rate(parseReplay_shadowCarball_total[1h]))
    ) > 0.20
  for: 15m
  annotations:
    summary: "Carball shadow parser error rate above 20%"
```

---

## Log Analysis

In addition to metrics, you can search your application logs for detailed information:

### Search for Shadow Parser Failures
```
"Carball shadow parsing failed" AND "replay_path"
```

### Search for Comparison Metrics
```
"Parser comparison metrics"
```

This will show the detailed JSON comparison output including:
- Parse durations for both parsers
- Success status
- Data structure differences
- Performance deltas

### Search for Analytics Publishing
```
"parseReplay_shadowCarball" AND "Published shadow parser analytics"
```

---

## Migration Decision Criteria

After collecting data for **1-2 weeks**, evaluate these criteria to decide whether to promote carball to primary:

### Success Rate
- ✅ **Target**: Shadow parser success rate ≥ 95%
- ✅ **Target**: Success rate parity within 2% of primary parser

### Performance
- ✅ **Target**: Average parse time ≤ primary parser (faster)
- ✅ **Target**: P95 parse time ≤ primary parser + 20%

### Reliability
- ✅ **Target**: No crashes or memory leaks
- ✅ **Target**: Error types are well-understood and documented

### Data Quality
- ✅ **Target**: Output structure is compatible with downstream consumers
- ✅ **Target**: No critical data missing from carball output

If all criteria are met, you can:
1. Switch production config to `"parser": "carball"`
2. Keep ballchasing API key as fallback for edge cases
3. Monitor closely for first 48 hours after promotion
