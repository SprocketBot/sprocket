import type {WriteApi} from "@influxdata/influxdb-client";
import {InfluxDB, Point} from "@influxdata/influxdb-client";
import {Injectable, Logger} from "@nestjs/common";
import {config} from "@sprocketbot/common";
import type {DebouncedFunc} from "lodash";
import {throttle} from "lodash";

import type {AnalyticsPoint} from "./analytics.schema";

@Injectable()
export class AnalyticsService {
    private influx: InfluxDB;

    private writeApi: WriteApi;

    private logger = new Logger(AnalyticsService.name);

    private readonly flush: DebouncedFunc<() => void>;

    constructor() {
        const influxUrl = config.influx.address;
        const influxOrg = config.influx.org;
        const influxBucket = config.influx.bucket;

        this.influx = new InfluxDB({
            url: influxUrl,
            token: config.influx.token,
        });
        this.writeApi = this.influx.getWriteApi(influxOrg, influxBucket, "ms");
        this.logger.log(`Connected to InfluxDB, url='${influxUrl}', org='${influxOrg}', bucket='${influxBucket}'`);

        const flushThrottle = 1000;
        this.flush = throttle<() => void>(() => {
            this.writeApi.flush()
                .then(() => { this.logger.log("Flushed InfluxDB Points") })
                .catch(this.logger.error.bind(this.logger));
        }, flushThrottle);
    }
    
    createPoint = (data: AnalyticsPoint): void => {
        try {
            const point = new Point();
            if (data.booleans) data.booleans.forEach(([name, value]) => point.booleanField(name, value));
            if (data.floats) data.floats.forEach(([name, value]) => point.floatField(name, value));
            if (data.ints) data.ints.forEach(([name, value]) => point.intField(name, value));
            if (data.strings) data.strings.forEach(([name, value]) => point.stringField(name, value));
            if (data.tags) data.tags.forEach(([name, value]) => point.tag(name, value));
            point.measurement(data.name);
            point.timestamp(new Date());
            this.writeApi.writePoint(point);
            this.flush();
        } catch (e) {
            this.logger.error(e);
            throw e;
        }
    };

}
