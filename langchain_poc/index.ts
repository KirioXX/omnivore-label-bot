import { CheerioWebBaseLoader } from "langchain/document_loaders/web/cheerio";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { ConversationalRetrievalQAChain } from "langchain/chains";
import { OllamaEmbeddings } from "@langchain/community/embeddings/ollama";
import { ChatOllama } from "@langchain/community/chat_models/ollama";

import "dotenv/config";

const articleUrl =
  "https://analyticsindiamag.com/now-run-programs-in-real-time-with-llama-3-on-groq/";

(async function () {
  // Fetch the article page
  const loader = new CheerioWebBaseLoader(articleUrl);
  const docs = await loader.load();

  console.log("Document loaded");
  console.log(docs.length);
  console.log(docs[0].pageContent.length);

  // Split the article into pages
  const splitter = new RecursiveCharacterTextSplitter({
    // chunkSize: 16384,
    // chunkOverlap: 0,
    // separators: ["\n\n", "\n", " ", ""],
  });
  const splitDocs = await splitter.splitDocuments(docs);

  console.log("Document split");
  console.log(splitDocs.length);
  console.log(splitDocs[0].pageContent.length);

  // Create embeddings
  const embeddings = new OllamaEmbeddings({
    model: "llama3",
    maxConcurrency: 5,
  });
  const vectorStore = await MemoryVectorStore.fromDocuments(
    splitDocs,
    embeddings
  );

  // Setup model
  const model = new ChatOllama({
    model: "llama3",
    format: "json",
  });
  // Setup the chain
  const chain = ConversationalRetrievalQAChain.fromLLM(
    model,
    vectorStore.asRetriever()
  );
  const response = await chain.invoke({
    question: `Recommend upto 5 relavant labels to the given article.
    Don't make things up and stick to the content of the article.
    Return the labels in the form of a list like this:
    {labels: ["label1", "label2", "label3", "label4", "label5"]}`,
    chat_history: [],
  });

  console.log("Response");
  console.log(response.text);
})();
