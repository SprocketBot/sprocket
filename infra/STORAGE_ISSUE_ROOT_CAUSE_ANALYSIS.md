# Storage Issue Root Cause Analysis

## The Real Problem

The 24GB overlay2 storage issue is **NOT** primarily a log accumulation problem. It's a **service failure cascade** causing container restart loops.

## What's Actually Happening

1. **Services are failing to start** - submission-service, matchmaking-service, notification-service
2. **Each failure creates a new container layer** - Docker keeps the old layers for rollback capability
3. **Restart loops accumulate layers** - Each restart attempt adds ~1GB to overlay2
4. **24GB = ~24 failed restart cycles** - Each service creates multiple layers per failure

## Evidence Found

From the logs:
```
OperationalError: connect ECONNREFUSED 10.0.14.17:5672
```

But RabbitMQ logs show:
```
2025-11-17 02:40:54.880981+00:00 [info] <0.1991.0> connection <0.1991.0> (10.0.14.3:39856 -> 10.0.14.17:5672): user 'guest' authenticated
```

**Other services are successfully connecting to RabbitMQ, but the failing services are not.**

## Root Cause

The failing services (submission, matchmaking, notification) have **configuration/authentication issues** that prevent them from:
1. Connecting to RabbitMQ (despite it being available)
2. Starting properly
3. Staying running

This creates a restart loop where:
- Service tries to start → Fails → Creates new layer
- Docker restarts service → Fails again → Creates another layer
- Cycle repeats indefinitely → overlay2 grows

## Why Standard Cleanup Didn't Work

`docker system prune` only removes:
- Stopped containers
- Unused networks
- Dangling images
- Build cache

**It does NOT remove layers from failed containers that are still being restarted by Docker Swarm.**

## The Solution Strategy

1. **Fix the service failures** - Stop the restart loops
2. **Remove the accumulated layers** - Once services are stable
3. **Prevent future accumulation** - Better error handling and restart policies

## Immediate Actions Needed

1. **Investigate why these specific services can't connect to RabbitMQ**
2. **Check their configuration vs working services**
3. **Fix the underlying authentication/configuration issue**
4. **Then cleanup the accumulated layers**

## Key Insight

**The storage issue is a symptom, not the disease.** 
- Disease: Services failing to start
- Symptom: overlay2 directory growing
- Cure: Fix the service startup issues

Until we fix why these services are failing, the storage will continue to grow regardless of cleanup scripts.