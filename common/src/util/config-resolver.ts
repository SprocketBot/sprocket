import _config from 'config';
import { config as dotenvConfig } from 'dotenv';
import { existsSync, readFileSync } from 'fs';

// Load .env file if it exists (dotenv doesn't error if file doesn't exist)
dotenvConfig();

/**
 * Resolves configuration values from multiple sources in priority order:
 * 1. Environment variables
 * 2. .env file (loaded by dotenv)
 * 3. File-based secrets (./secret/*.txt)
 * 4. Config library (config package)
 */
export class ConfigResolver {
  /**
   * Get a secret value (sensitive data) from multiple sources
   * @param envKey Environment variable name
   * @param filePath Path to secret file (relative to working directory)
   * @param configKey Optional config library key as fallback
   */
  static getSecret(envKey: string, filePath: string, configKey?: string): string {
    // 1. Check environment variable first
    if (process.env[envKey]) {
      return process.env[envKey]!.trim();
    }

    // 2. Check file-based secret (current approach)
    if (existsSync(filePath)) {
      return readFileSync(filePath).toString().trim();
    }

    // 3. Fall back to config library if provided
    if (configKey && _config.has(configKey)) {
      return _config.get<string>(configKey);
    }

    throw new Error(
      `Secret not found: ${envKey} (env var), ${filePath} (file), ${
        configKey || 'no config key'
      } (config)`,
    );
  }

  /**
   * Get a configuration value (non-sensitive) from multiple sources
   * @param envKey Environment variable name
   * @param configKey Config library key
   * @param defaultValue Optional default value
   */
  static getConfig<T = string>(envKey: string, configKey: string, defaultValue?: T): T {
    // 1. Check environment variable first
    if (process.env[envKey] !== undefined) {
      const envValue = process.env[envKey]!;

      // Type conversion based on expected type
      if (typeof defaultValue === 'boolean') {
        return (envValue.toLowerCase() === 'true') as unknown as T;
      }
      if (typeof defaultValue === 'number') {
        return Number(envValue) as unknown as T;
      }
      return envValue as unknown as T;
    }

    // 2. Fall back to config library
    if (_config.has(configKey)) {
      return _config.get<T>(configKey);
    }

    // 3. Use default value if provided
    if (defaultValue !== undefined) {
      return defaultValue;
    }

    throw new Error(`Config not found: ${envKey} (env var), ${configKey} (config)`);
  }

  /**
   * Get a configuration value that might be boolean with backwards compatibility
   */
  static getBooleanConfig(envKey: string, configKey: string, defaultValue = false): boolean {
    return this.getConfig<boolean>(envKey, configKey, defaultValue);
  }

  /**
   * Get a configuration value that might be number with backwards compatibility
   */
  static getNumberConfig(envKey: string, configKey: string, defaultValue?: number): number {
    return this.getConfig<number>(envKey, configKey, defaultValue);
  }
}
