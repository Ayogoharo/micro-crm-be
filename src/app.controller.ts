import { Controller, Get } from '@nestjs/common';
import { AppService } from 'src/app.service';

/**
 * Root application controller.
 */
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  /**
   * Health check endpoint.
   */
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
