import { Process, Processor } from '@nestjs/bull';
import { PostType } from '../types';
import { Job } from 'bull';
import { LangchainService } from './langchain.service';
import { ConversationalRetrievalQAChain } from 'langchain/chains';
import { Logger } from '@nestjs/common';
import { OmnivoreService } from './omnivore.service';
import { ConfigService } from '@nestjs/config';
import { ChatMistralAI } from '@langchain/mistralai';

const labelsJsonSchema = {
  type: 'array',
  items: {
    type: 'object',
    properties: {
      name: { type: 'string' },
      description: { type: 'string' },
    },
    required: ['name'],
  },
  description: 'A list of labels for the given article.',
};

@Processor('omnivore')
export class OmnivorePostConsumer {
  constructor(
    private readonly langchainServie: LangchainService,
    private readonly omnivoreService: OmnivoreService,
    private readonly configService: ConfigService,
  ) {
    this.mistralAPIKey = this.configService.get<string>('llm.mistralAPIKey');
  }

  private logger = new Logger(OmnivorePostConsumer.name);
  private readonly mistralAPIKey;

  @Process()
  async process(job: Job<PostType>) {
    try {
      // Load article
      const articleUrl = job.data.page.originalUrl;
      this.logger.debug('url', articleUrl);
      const documents = await this.langchainServie.loadArticle(articleUrl);
      this.logger.debug('Document loaded');

      // Create vector store
      console.time('embedding');
      const embedding = await this.langchainServie.createEmbeddings(documents);
      console.timeEnd('embedding');
      this.logger.debug('Vector store created');
      const retriever = embedding.asRetriever();

      // Setup model
      const model = new ChatMistralAI({
        apiKey: this.mistralAPIKey,
        model: 'mistral-large-latest',
      });
      const modelWithTool = model.withStructuredOutput(labelsJsonSchema);

      // Setup the chain
      this.logger.debug('Setting up chain');
      const chain = ConversationalRetrievalQAChain.fromLLM(model, retriever);

      this.logger.debug('Processing chain');
      const response = await chain.invoke({
        question: `Recommend upto 5 relavant labels to the given article.
        Keep the labels short and favour 1 word labels.
        Don't make things up and stick to the content of the article.
        Return the labels in the following format:
        [
          {
            "name": "label1",
            "description": "description of label1"
          },
          {
            "name": "label2",
            "description": "description of label2"
          }
      ]`,
        chat_history: [],
        format_instructions: modelWithTool,
      });
      this.logger.debug('Chain processed');
      console.log(response);
      const jsonReponse = JSON.parse(response.text);

      this.logger.debug('LLM Labels:', jsonReponse);

      // Add labels to post
      this.logger.debug('Adding labels to post');
      const labels = jsonReponse;
      await this.omnivoreService.addLabelsToPost(job.data.page.id, labels);
      this.logger.debug('Labels added to post');
    } catch (error) {
      this.logger.error('Error processing job', error);
    }
  }
}
