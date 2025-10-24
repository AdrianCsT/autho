import { ConfigService } from '@nestjs/config';

export interface DocumentationConfig {
  enabled: boolean;
  path: string;
  title: string;
  description: string;
  version: string;
  servers: Array<{
    url: string;
    description: string;
  }>;
  hideInProduction: boolean;
  logUrl: boolean;
}

export class DocumentationConfigService {
  constructor(private configService: ConfigService) {}

  getDocumentationConfig(): DocumentationConfig {
    const nodeEnv = this.configService.get<string>('NODE_ENV', 'development');
    const port = this.configService.get<number>('PORT', 3000);
    const host = this.configService.get<string>('HOST', 'localhost');
    const protocol = this.configService.get<string>('PROTOCOL', 'http');
    
    // Documentation is disabled in production by default for security
    const isProduction = nodeEnv === 'production';
    const docsEnabledEnv = this.configService.get<string>('DOCS_ENABLED', '');
    
    let enabled: boolean;
    if (docsEnabledEnv !== '') {
      // If DOCS_ENABLED is explicitly set, use that value
      enabled = docsEnabledEnv.toLowerCase() === 'true';
    } else {
      // Default behavior: enabled in development/test, disabled in production
      enabled = !isProduction;
    }
    
    return {
      enabled,
      path: this.configService.get<string>('DOCS_PATH', '/api/docs'),
      title: this.configService.get<string>('DOCS_TITLE', 'API Documentation'),
      description: this.configService.get<string>(
        'DOCS_DESCRIPTION', 
        'Comprehensive API documentation for the NestJS backend application'
      ),
      version: this.configService.get<string>('DOCS_VERSION', '1.0.0'),
      servers: [
        {
          url: `${protocol}://${host}:${port}`,
          description: this.getServerDescription(nodeEnv),
        },
        // Add additional servers from environment if configured
        ...this.getAdditionalServers(),
      ],
      hideInProduction: this.configService.get<string>('DOCS_HIDE_IN_PRODUCTION', 'true').toLowerCase() === 'true',
      logUrl: this.configService.get<string>('DOCS_LOG_URL', 'true').toLowerCase() === 'true',
    };
  }

  private getServerDescription(nodeEnv: string): string {
    switch (nodeEnv) {
      case 'production':
        return 'Production server';
      case 'staging':
        return 'Staging server';
      case 'test':
        return 'Test server';
      default:
        return 'Development server';
    }
  }

  private getAdditionalServers(): Array<{ url: string; description: string }> {
    const additionalServers: Array<{ url: string; description: string }> = [];
    
    // Check for additional server configurations
    const stagingUrl = this.configService.get<string>('STAGING_SERVER_URL');
    if (stagingUrl) {
      additionalServers.push({
        url: stagingUrl,
        description: 'Staging server',
      });
    }

    const productionUrl = this.configService.get<string>('PRODUCTION_SERVER_URL');
    if (productionUrl) {
      additionalServers.push({
        url: productionUrl,
        description: 'Production server',
      });
    }

    return additionalServers;
  }

  shouldEnableDocumentation(): boolean {
    return this.getDocumentationConfig().enabled;
  }

  getDocumentationUrl(): string {
    const config = this.getDocumentationConfig();
    const baseUrl = config.servers[0]?.url || 'http://localhost:3000';
    return `${baseUrl}${config.path}`;
  }
}