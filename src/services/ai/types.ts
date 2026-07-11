export type AiProvider = {
  estimateStyle(input: unknown): Promise<unknown>;
  analyzeImages?(imageRefs: string[]): Promise<unknown>;
};
