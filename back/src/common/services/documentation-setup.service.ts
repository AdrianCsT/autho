import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { apiReference } from '@scalar/nestjs-api-reference';
import { DocumentationConfigService } from '../config/documentation.config';
import { DocumentationLoggerService } from './documentation-logger.service';

@Injectable()
export class DocumentationSetupService {
  constructor(
    private configService: ConfigService,
    private documentationConfig: DocumentationConfigService,
    private documentationLogger: DocumentationLoggerService,
  ) { }

  async setupDocumentation(app: INestApplication): Promise<void> {
    try {
      const config = this.documentationConfig.getDocumentationConfig();

      if (!config.enabled) {
        this.documentationLogger.logDocumentationDisabled('Environment configuration');
        return;
      }

      // Configure OpenAPI document generation
      const documentBuilder = new DocumentBuilder()
        .setTitle(config.title)
        .setDescription(config.description)
        .setVersion(config.version);

      // Add servers
      config.servers.forEach(server => {
        documentBuilder.addServer(server.url, server.description);
      });

      // Add authentication configuration
      documentBuilder.addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          name: 'Authorization',
          description: 'Enter JWT token (Bearer token obtained from /auth/login)',
          in: 'header',
        },
        'bearer',
      );

      // Configure endpoint grouping and organization
      documentBuilder
        .addTag('Authentication', 'User authentication and session management endpoints')
        .addTag('Users', 'User account management and profile operations');

      const documentConfig = documentBuilder.build();
      const document = SwaggerModule.createDocument(app, documentConfig);

      // Enhance document with custom ordering and grouping
      this.enhanceDocumentStructure(document);

      // Set up Scalar UI
      this.setupScalarUI(app, document, config);

      // Log successful setup
      this.documentationLogger.logDocumentationStartup();

    } catch (error) {
      this.documentationLogger.logDocumentationError(error as Error);
      throw error;
    }
  }

  private enhanceDocumentStructure(document: any): void {
    // Enhance document with custom ordering and grouping
    document.tags = [
      {
        name: 'Authentication',
        description: 'User authentication and session management endpoints. Handle user login, logout, token refresh, and verification.',
        externalDocs: {
          description: 'Learn more about JWT authentication',
          url: 'https://jwt.io/introduction'
        }
      },
      {
        name: 'Users',
        description: 'User account management and profile operations. Create new accounts and manage user profiles.',
      }
    ];

    // Ensure proper endpoint ordering within tags
    if (document.paths) {
      const orderedPaths: any = {};

      // Authentication endpoints in logical order
      const authOrder = ['/auth/login', '/auth/refresh', '/auth/verify', '/auth/logout'];
      authOrder.forEach(path => {
        if (document.paths[path]) {
          orderedPaths[path] = document.paths[path];
        }
      });

      // Users endpoints in logical order
      const usersOrder = ['/users/register', '/users/profile'];
      usersOrder.forEach(path => {
        if (document.paths[path]) {
          orderedPaths[path] = document.paths[path];
        }
      });

      // Add any remaining paths that weren't explicitly ordered
      Object.keys(document.paths).forEach(path => {
        if (!orderedPaths[path]) {
          orderedPaths[path] = document.paths[path];
        }
      });

      document.paths = orderedPaths;
    }
  }

  private setupScalarUI(app: INestApplication, document: any, config: any): void {
    const nodeEnv = this.configService.get<string>('NODE_ENV', 'development');
    const isProduction = nodeEnv === 'production';

    // Production-ready configuration
    const scalarConfig = {
      spec: {
        content: document,
      },
      theme: 'default',
      layout: 'modern',
      showSidebar: true,
      customCss: this.getCustomCSS(),
      metaData: {
        title: config.title,
        description: config.description,
        ogDescription: 'Interactive API documentation with modern UI',
      },
      configuration: {
        hideDownloadButton: isProduction, // Hide download in production
        hideTestRequestButton: isProduction, // Disable testing in production
        isEditable: false,
        tagsSorter: 'alpha',
        operationsSorter: 'alpha',
        defaultOpenAllTags: !isProduction, // Collapse tags in production
        showExtensions: !isProduction, // Hide extensions in production
        hideSchemas: false,
        // Additional production security settings
        ...(isProduction && {
          hideModels: true,
          hideTryIt: true,
          hideServerSelection: true,
        }),
      },
    };

    app.use(config.path, apiReference(scalarConfig));
  }

  private getCustomCSS(): string {
    return `
      /* Enhanced navigation and grouping styles */
      .scalar-api-reference__sidebar {
        --scalar-sidebar-width: 320px;
      }
      .scalar-api-reference__sidebar-group {
        margin-bottom: 1rem;
      }
      .scalar-api-reference__sidebar-group-title {
        font-weight: 600;
        font-size: 0.875rem;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: var(--scalar-color-1);
        margin-bottom: 0.5rem;
      }
      .scalar-api-reference__sidebar-item {
        padding: 0.5rem 0.75rem;
        border-radius: 0.375rem;
        margin-bottom: 0.25rem;
      }
      .scalar-api-reference__sidebar-item:hover {
        background-color: var(--scalar-background-2);
      }
    `;
  }
}