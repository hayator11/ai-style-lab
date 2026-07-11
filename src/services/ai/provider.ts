import type { AiProvider } from './types';

export function createAiProvider(): AiProvider {
  return {
    async estimateStyle() {
      throw new Error('AI provider is not implemented yet.');
    },
  };
}
