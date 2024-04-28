import { registerAs } from '@nestjs/config';

export default registerAs('llm', () => ({
  mistralAPIKey: process.env.MISTRAL_API_KEY,
}));
