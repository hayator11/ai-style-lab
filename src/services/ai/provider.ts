import type { AiProvider } from './types';

export function createAiProvider(): AiProvider {
  return {
    async estimateStyle(input: unknown) {
      return {
        mode: 'preview',
        input,
        message: 'AI provider keys are not set. Showing the local preview result.',
      };
    },
  };
}
