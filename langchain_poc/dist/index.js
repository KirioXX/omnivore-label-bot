"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const cheerio_1 = require("langchain/document_loaders/web/cheerio");
const text_splitter_1 = require("langchain/text_splitter");
const memory_1 = require("langchain/vectorstores/memory");
const chains_1 = require("langchain/chains");
const ollama_1 = require("@langchain/community/embeddings/ollama");
const ollama_2 = require("@langchain/community/chat_models/ollama");
require("dotenv/config");
const articleUrl = "https://analyticsindiamag.com/now-run-programs-in-real-time-with-llama-3-on-groq/";
(function () {
    return __awaiter(this, void 0, void 0, function* () {
        // Fetch the article page
        const loader = new cheerio_1.CheerioWebBaseLoader(articleUrl);
        const docs = yield loader.load();
        console.log("Document loaded");
        console.log(docs.length);
        console.log(docs[0].pageContent.length);
        // Split the article into pages
        const splitter = new text_splitter_1.RecursiveCharacterTextSplitter({
        // chunkSize: 16384,
        // chunkOverlap: 0,
        // separators: ["\n\n", "\n", " ", ""],
        });
        const splitDocs = yield splitter.splitDocuments(docs);
        console.log("Document split");
        console.log(splitDocs.length);
        console.log(splitDocs[0].pageContent.length);
        // Create embeddings
        const embeddings = new ollama_1.OllamaEmbeddings({
            model: "llama3",
            maxConcurrency: 5,
        });
        const vectorStore = yield memory_1.MemoryVectorStore.fromDocuments(splitDocs, embeddings);
        // Setup model
        const model = new ollama_2.ChatOllama({
            model: "llama3",
            format: "json",
        });
        // Setup the chain
        const chain = chains_1.ConversationalRetrievalQAChain.fromLLM(model, vectorStore.asRetriever());
        const response = yield chain.invoke({
            question: `Recommend upto 5 relavant labels to the given article.
    Don't make things up and stick to the content of the article.
    Return the labels in the form of a list like this:
    {labels: ["label1", "label2", "label3", "label4", "label5"]}`,
            chat_history: [],
        });
        console.log("Response");
        console.log(response.text);
    });
})();
