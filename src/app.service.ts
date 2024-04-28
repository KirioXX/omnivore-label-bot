import { InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bull';
import { PostType } from './types';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppService {
  constructor(
    @InjectQueue('omnivore') private readonly omnivoreQueue: Queue,
    private readonly configService: ConfigService,
  ) {}

  addPostToQueue(post: PostType) {
    if (!post) throw new Error('Post is required');

    // Check if post belongs to user
    const userId = this.configService.get<string>('omnivore.userId');
    if (post.userId !== userId) throw new Error('Post does not belong to user');

    // Add post to queue
    this.omnivoreQueue.add(post);
  }
}
