import { registerAs } from '@nestjs/config';

export default registerAs('database', () => ({
  supabase_url: 'http://localhost:3000',
  supabase_service_role_key: 'test_key',
}));
