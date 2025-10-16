import { Injectable } from '@nestjs/common';

/**
 * Root application service.
 */
@Injectable()
export class AppService {
  /**
   * Returns a hello message.
   */
  getHello(): string {
    return 'Hello World!';
  }
}
