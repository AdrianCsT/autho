import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentationConfigService } from '../config/documentation.config';

@Injectable()
export class DocumentationLoggerService {
  private readonly logger = new Logger('DocumentationService');

  constructor(
    private configService: ConfigService,
    private documentationConfig: DocumentationConfigService,
  ) {}

  logDocumentationStartup(): void {
    const config = this.documentationConfig.getDocumentationConfig();
    const nodeEnv = this.configService.get<string>('NODE_ENV', 'development');

    if (!config.enabled) {
      this.logger.log(`📚 API Documentation is disabled in ${nodeEnv} environment`);
      if (nodeEnv === 'production') {
        this.logger.log('💡 To enable documentation in production, set DOCS_ENABLED=true');
      }
      return;
    }

    if (config.logUrl) {
      const documentationUrl = this.documentationConfig.getDocumentationUrl();
      
      this.logger.log(`📚 API Documentation is available at: ${documentationUrl}`);
      this.logger.log(`🎨 Using Scalar UI for modern documentation interface`);
      
      if (nodeEnv === 'development') {
        this.logger.log('🔧 Development mode: Documentation includes all endpoints and features');
      } else if (nodeEnv === 'production') {
        this.logger.warn('⚠️  Production mode: Documentation is enabled - ensure this is intentional');
        this.logger.log('🔒 Consider disabling documentation in production for security');
      }

      // Log server configurations
      config.servers.forEach((server, index) => {
        if (index === 0) {
          this.logger.log(`🌐 Primary server: ${server.url} (${server.description})`);
        } else {
          this.logger.log(`🌐 Additional server: ${server.url} (${server.description})`);
        }
      });
    }
  }

  logDocumentationError(error: Error): void {
    this.logger.error('❌ Failed to initialize API documentation', error.stack);
  }

  logDocumentationDisabled(reason: string): void {
    this.logger.log(`📚 API Documentation disabled: ${reason}`);
  }
}