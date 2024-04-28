import { registerAs } from '@nestjs/config';

export default registerAs('database', () => ({
  host: process.env.REDISHOST || 'localhost',
  port: parseInt(process.env.REDISPORT) || 6379,
  username: process.env.REDISUSER,
  password: process.env.REDISPASSWORD,
}));
