export default (serviceName: string, isUtil: boolean): { name: string; options: { [key: string]: string } } => {
    // Services that should NOT use fluentd to avoid circular logging or other issues
    const noFluentdServices = ['loki', 'fluent', 'fluentd'];
    const shouldUseJsonFile = noFluentdServices.some(name => serviceName.toLowerCase().includes(name));

    if (shouldUseJsonFile) {
        return {
            name: "json-file",
            options: {
                "max-size": "5m",
                "max-file": "5",
                "compress": "true"
            }
        };
    }

    return {
        name: "fluentd",
        options: {
            // Use Docker gateway IP instead of localhost for more reliable startup
            // The gateway routes to the host where fluentd is published in host mode
            "fluentd-address": "172.18.0.1:24224",
            "tag": "docker.{{.FullID}}.{{.Name}}",
            "fluentd-async": "true",
            "fluentd-retry-wait": "1s",
            "fluentd-max-retries": "3",
            "mode": "non-blocking",
            "max-buffer-size": "4m"
        }
    };
}