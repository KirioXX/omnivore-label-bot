import { Body, Controller, Get, Logger, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { PostType } from './types';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}
  logger = new Logger(AppController.name);

  @Post('omnivore')
  newPost(@Body() post: PostType) {
    if (Object.keys(post).length === 0) {
      return 'No post provided';
    }
    this.logger.debug('New post received');
    this.appService.addPostToQueue(post);
  }
}
