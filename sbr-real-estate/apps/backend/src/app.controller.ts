import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AppService } from './app.service';
import { Public } from './common/decorators/public.decorator';
/** Public API identification endpoint. */
@ApiTags('Application')
@Public()
@Controller()
export class AppController {
  /** Injects the application service. */
  constructor(private readonly appService: AppService) {}
  /** Returns API identity. */
  @Get()
  @ApiOperation({ summary: 'API identity' })
  getInfo(): { name: string; phase: number } {
    return this.appService.getInfo();
  }
}
