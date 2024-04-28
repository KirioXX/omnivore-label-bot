import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class OmnivoreService {
  constructor(private readonly configService: ConfigService) {}

  private stringifyObject(obj) {
    return (
      '{' +
      Object.keys(obj)
        .map((key) => `${key}:${JSON.stringify(obj[key])}`)
        .join(',') +
      '}'
    );
  }

  async addLabelsToPost(
    postId: string,
    labels: { name: string; description: string }[],
  ) {
    console.log('Adding labels to post', postId, labels);
    const apiKey = this.configService.get<string>('omnivore.apiKey');
    if (!apiKey) {
      throw new Error('API key not found');
    }

    const response = await fetch('https://api-prod.omnivore.app/api/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        authorization: apiKey,
      },
      body: JSON.stringify({
        query: `mutation SetLabels {
            setLabels(
                input: {
                    pageId: "${postId}"
                    labels: [${labels.map(this.stringifyObject)}]
                }
            ) {
                ... on SetLabelsError {
                    errorCodes
                }
            }
        }`,
      }),
    });
    const json = await response.json();
    console.log('Response', json);
  }
}
