import { Injectable } from '@nestjs/common';
import { CheerioWebBaseLoader } from 'langchain/document_loaders/web/cheerio';
import { Document } from 'langchain/document';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { MemoryVectorStore } from 'langchain/vectorstores/memory';
import { ConfigService } from '@nestjs/config';
import { MistralAIEmbeddings } from '@langchain/mistralai';

@Injectable()
export class LangchainService {
  private readonly mistralAPIKey: string;

  constructor(private readonly configService: ConfigService) {
    this.mistralAPIKey = this.configService.get<string>('llm.mistralAPIKey');
  }

  async loadArticle(
    articleUrl: string,
  ): Promise<Document<Record<string, any>>[]> {
    // Fetch the article page
    const loader = new CheerioWebBaseLoader(articleUrl);
    const docs = await loader.load();

    // Split the article into pages
    const splitter = new RecursiveCharacterTextSplitter();
    const splitDocs = await splitter.splitDocuments(docs);

    return splitDocs;
  }

  async createEmbeddings(splitDocs: Document<Record<string, any>>[]) {
    const embeddings = new MistralAIEmbeddings({
      apiKey: this.mistralAPIKey,
    });
    const vectorStore = await MemoryVectorStore.fromDocuments(
      splitDocs,
      embeddings,
    );
    return vectorStore;
  }
}
