import type { DiagnosisResult } from '@/lib/diagnosis/types';

export async function saveDiagnosisHistory(_result: DiagnosisResult): Promise<void> {
  throw new Error('Diagnosis history storage is not implemented yet.');
}
