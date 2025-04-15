import * as os from 'os';
import * as process from 'process';
import { performance } from 'perf_hooks';
import { Request, Response, NextFunction, Application } from 'express';

interface MonitorOptions {
    metricsInterval?: number;
    enableEndpoint?: boolean;
    endpoint?: string;
    dashboardUrl?: string;
    dashboardInterval?: number;
    authToken?: string;
}

interface RequestMetrics {
    total: number;
    paths: Record<string, number>;
    methods: Record<string, number>;
    status: Record<string, number>;
}

interface ResponseTimeMetrics {
    total: number;
    count: number;
    average: number;
    min: number;
    max: number;
}

interface ErrorMetrics {
    count: number;
    types: Record<number, number>;
}

interface MemoryMetrics {
    rss: number;
    heapTotal: number;
    heapUsed: number;
    external: number;
    arrayBuffers: number;
    totalSystemMemory: number;
    freeSystemMemory: number;
    percentUsed: string;
}

interface CpuMetrics {
    loadAverage: number[];
    cpuCount: number;
    cpuModel: string;
    processUptime: number;
}

interface Metrics {
    startTime: number;
    requests: RequestMetrics;
    requestsPerSecond: number;
    responseTimes: ResponseTimeMetrics;
    errors: ErrorMetrics;
    memory: Partial<MemoryMetrics>;
    cpu: Partial<CpuMetrics>;
    load: number[];
    uptime: number;
}

interface ServiceInfo {
    name: string;
    version: string;
    nodeVersion: string;
    platform: string;
    hostname: string;
}

interface MetricsResponse {
    service: ServiceInfo;
    metrics: Metrics;
}

/**
 * Middleware for monitoring Express server resources and metrics
 * @param options Configuration options
 */
function expressMonitor(options: MonitorOptions = {}): (req: Request, res: Response, next: NextFunction) => void {
    const defaultOptions: Required<MonitorOptions> = {
        metricsInterval: 15000,
        enableEndpoint: true,
        endpoint: '/metrics',
        dashboardUrl: '',
        dashboardInterval: 30000,
        authToken: ''
    };

    const config = { ...defaultOptions, ...options };

    // Store for metrics data
    const metrics: Metrics = {
        startTime: Date.now(),
        requests: {
            total: 0,
            paths: {},
            methods: {},
            status: {}
        },
        requestsPerSecond: 0,
        responseTimes: {
            total: 0,
            count: 0,
            average: 0,
            min: Number.MAX_SAFE_INTEGER,
            max: 0
        },
        errors: {
            count: 0,
            types: {}
        },
        memory: {},
        cpu: {},
        load: [],
        uptime: 0
    };

    // Temporary request counter for RPS calculation
    let tempRequestCount = 0;

    // Calculate requests per second
    setInterval(() => {
        metrics.requestsPerSecond = tempRequestCount;
        tempRequestCount = 0;
    }, 1000);

    // Collect server metrics at intervals
    setInterval(() => {
        // Memory metrics
        const memoryUsage = process.memoryUsage();
        metrics.memory = {
            rss: memoryUsage.rss, // Resident Set Size - total memory allocated
            heapTotal: memoryUsage.heapTotal, // V8 heap allocated
            heapUsed: memoryUsage.heapUsed, // V8 heap used
            external: memoryUsage.external, // C++ objects bound to JS objects
            arrayBuffers: memoryUsage.arrayBuffers || 0,
            totalSystemMemory: os.totalmem(),
            freeSystemMemory: os.freemem(),
            percentUsed: ((os.totalmem() - os.freemem()) / os.totalmem() * 100).toFixed(2)
        };

        // CPU metrics
        metrics.cpu = {
            loadAverage: os.loadavg(),
            cpuCount: os.cpus().length,
            cpuModel: os.cpus()[0].model,
            processUptime: process.uptime()
        };

        // Load average
        metrics.load = os.loadavg();

        // Uptime
        metrics.uptime = Math.floor((Date.now() - metrics.startTime) / 1000);

    }, config.metricsInterval);

    // Send metrics to dashboard if URL is provided
    if (config.dashboardUrl) {
        setInterval(() => {
            try {
                fetch(config.dashboardUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${config.authToken}`
                    },
                    body: JSON.stringify({
                        timestamp: Date.now(),
                        metrics: { ...metrics }
                    })
                }).catch(err => console.error('Error sending metrics to dashboard:', err));
            } catch (error) {
                console.error('Failed to send metrics to dashboard:', error);
            }
        }, config.dashboardInterval);
    }

    // Express middleware function
    return function(req: Request, res: Response, next: NextFunction): void {
        // Skip monitoring for metrics endpoint to avoid circular tracking
        if (config.enableEndpoint && req.path === config.endpoint) {
            return next();
        }

        const startTime = performance.now();
        tempRequestCount++;
        metrics.requests.total++;

        // Track request by path
        metrics.requests.paths[req.path] = (metrics.requests.paths[req.path] || 0) + 1;

        // Track request by method
        metrics.requests.methods[req.method] = (metrics.requests.methods[req.method] || 0) + 1;

        // Track response time and status code
        const originalEnd = res.end;

        res.end = function(...args: any[]): any {
            const responseTime = performance.now() - startTime;

            // Update response time metrics
            metrics.responseTimes.total += responseTime;
            metrics.responseTimes.count++;
            metrics.responseTimes.average = metrics.responseTimes.total / metrics.responseTimes.count;
            metrics.responseTimes.min = Math.min(metrics.responseTimes.min, responseTime);
            metrics.responseTimes.max = Math.max(metrics.responseTimes.max, responseTime);

            // Track status codes
            const statusCode = res.statusCode;
            metrics.requests.status[statusCode] = (metrics.requests.status[statusCode] || 0) + 1;

            // Track errors (status >= 400)
            if (statusCode >= 400) {
                metrics.errors.count++;
                const errorCategory = Math.floor(statusCode / 100) * 100;
                metrics.errors.types[errorCategory] = (metrics.errors.types[errorCategory] || 0) + 1;
            }

            return originalEnd.apply(res, args);
        };

        next();
    };
}

/**
 * Sets up the metrics endpoint to expose collected data
 */
function metricsEndpoint(metrics: Metrics, app: Application, options: Required<MonitorOptions>): void {
    const { endpoint } = options;

    app.get(endpoint, (_: Request, res: Response) => {
        const response: MetricsResponse = {
            service: {
                name: process.env.SERVICE_NAME || 'express-server',
                version: process.env.SERVICE_VERSION || '1.0.0',
                nodeVersion: process.version,
                platform: process.platform,
                hostname: os.hostname()
            },
            metrics
        };

        res.json(response);
    });
}

/**
 * Main export function that sets up monitoring for an Express application
 */
export default function(app: Application, options: MonitorOptions = {}): (req: Request, res: Response, next: NextFunction) => void {
    const metrics: Metrics = {} as Metrics; // Reference to the metrics store

    // Create and attach the middleware
    const middleware = expressMonitor(options);
    app.use(middleware);

    // Create metrics endpoint if enabled
    if (options.enableEndpoint !== false) {
        metricsEndpoint(metrics, app, { ...options } as Required<MonitorOptions>);
    }

    return middleware;
}
