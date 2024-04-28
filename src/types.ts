export type PostType = {
  action: string;
  userId: string;
  page: {
    type: string;
    userId: string;
    id: string;
    slug: string;
    description: string;
    title: string;
    author: string;
    originalUrl: string;
    itemType: string;
    textContentHash: string;
    thumbnail: string;
    publishedAt: string;
    readingProgressTopPercent: number;
    readingProgressHighestReadAnchor: number;
    state: string;
    createdAt: string;
    savedAt: string;
    siteName: string;
    itemLanguage: string;
    siteIcon: string;
    wordCount: number;
    archivedAt: string;
  };
};
