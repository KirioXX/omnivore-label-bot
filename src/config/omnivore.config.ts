import { registerAs } from '@nestjs/config';

export default registerAs('omnivore', () => ({
  apiKey: process.env.OMNIVORE_API_KEY || 'omnivore',
  userId: process.env.OMNIVORE_USER_ID || 'omnivore',
}));
