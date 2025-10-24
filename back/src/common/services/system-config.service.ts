import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class SystemConfigService {
  constructor(private prisma: PrismaClient) {}

  async getConfig(key: string, defaultValue?: string): Promise<string | null> {
    const config = await this.prisma.systemConfig.findUnique({
      where: { key }
    });
    return config?.value || defaultValue || null;
  }

  async setConfig(key: string, value: string): Promise<void> {
    await this.prisma.systemConfig.upsert({
      where: { key },
      update: { value },
      create: { key, value }
    });
  }


}