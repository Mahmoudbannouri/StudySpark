export interface Quota {
    id: number;
    userId: number;
    maxUploads: number;
    usedUploads: number;
    maxAIRequests: number;
    usedAIRequests: number;
    resetDate: string;
  }
  