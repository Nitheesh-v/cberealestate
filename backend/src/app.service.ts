import { Injectable } from '@nestjs/common';
/** Supplies non-sensitive application identification. */
@Injectable()
export class AppService {
  /** Returns the API identity without environment or secret details. */
  getInfo(): { name: string; phase: number } {
    return { name: 'SBR Real Estate API', phase: 1 };
  }
}
