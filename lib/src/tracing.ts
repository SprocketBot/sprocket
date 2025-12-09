import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { NodeSDK } from '@opentelemetry/sdk-node';
import { AsyncLocalStorageContextManager } from '@opentelemetry/context-async-hooks';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import {
  CompositePropagator,
  W3CTraceContextPropagator,
  W3CBaggagePropagator,
} from '@opentelemetry/core';
import { B3InjectEncoding, B3Propagator } from '@opentelemetry/propagator-b3';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import * as process from 'process';

const traceExporter = new OTLPTraceExporter({
  url: process.env.TEMPO_URL ?? 'http://tempo:4318/v1/traces',
});

const spanProcessor = new BatchSpanProcessor(traceExporter);

const otelSDK = new NodeSDK({
  serviceName: process.env.SERVICE_NAME ?? 'SprocketUnknownService',
  //   metricReader,
  spanProcessors: [spanProcessor as any],
  contextManager: new AsyncLocalStorageContextManager(),
  instrumentations: getNodeAutoInstrumentations({
    '@opentelemetry/instrumentation-fs': { enabled: false },
    '@opentelemetry/instrumentation-http': { enabled: true },
    '@opentelemetry/instrumentation-nestjs-core': { enabled: true },
    '@opentelemetry/instrumentation-graphql': { enabled: true },
    '@opentelemetry/instrumentation-express': { enabled: true },
    '@opentelemetry/instrumentation-pino': { enabled: true },
  }),

  textMapPropagator: new CompositePropagator({
    propagators: [
      new W3CTraceContextPropagator(),
      new W3CBaggagePropagator(),
      new B3Propagator(),
      new B3Propagator({
        injectEncoding: B3InjectEncoding.MULTI_HEADER,
      }),
    ],
  }),
});

export default otelSDK;
// You can also use the shutdown method to gracefully shut down the SDK before process shutdown
// or on some operating system signal.
process.on('SIGTERM', () => {
  otelSDK
    .shutdown()
    .then(
      () => console.log('SDK shut down successfully'),
      (err) => console.log('Error shutting down SDK', err),
    )
    .finally(() => process.exit(0));
});

otelSDK.start();

// You need to have an explicit require to get instrumentation properly
function tryRequire(pack: string) {
  try {
    require(pack);
  } catch {
    console.log(`Package '${pack}' not available`);
  }
}

tryRequire('bullmq');