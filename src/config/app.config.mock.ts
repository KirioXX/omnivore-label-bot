import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  port: 3000,
  version: 'v1',
  auth_secret: 'test_secret',
}));
