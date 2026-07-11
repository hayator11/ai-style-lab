import type { Label } from '@/lib/diagnosis/types';

const STORAGE_KEY = 'ai-style-lab:labels';

type StoredLabelByAxis<TAxis extends Label['axis']> = Extract<Label, { axis: TAxis }>;

export type CreateLabelInput =
  | LabelCreateInputFor<'bone'>
  | LabelCreateInputFor<'face'>
  | LabelCreateInputFor<'color'>;

type LabelCreateInputFor<TAxis extends Label['axis']> = Omit<
  StoredLabelByAxis<TAxis>,
  'labelId' | 'createdAt' | 'updatedAt'
> &
  Partial<Pick<StoredLabelByAxis<TAxis>, 'labelId' | 'createdAt' | 'updatedAt'>>;

export type LabelStore = {
  create(input: CreateLabelInput): Promise<Label>;
  get(labelId: string): Promise<Label | undefined>;
  list(filter?: LabelListFilter): Promise<Label[]>;
  delete(labelId: string): Promise<boolean>;
};

export type LabelListFilter = {
  imageId?: string;
  axis?: Label['axis'];
  source?: Label['source'];
  isGroundTruth?: boolean;
};

let memoryLabels: Label[] | undefined;

function getBrowserStorage(): Storage | undefined {
  if (typeof window === 'undefined') {
    return undefined;
  }

  return window.localStorage;
}

function readLabels(): Label[] {
  if (memoryLabels) {
    return memoryLabels;
  }

  const storage = getBrowserStorage();
  if (!storage) {
    memoryLabels = [];
    return memoryLabels;
  }

  const raw = storage.getItem(STORAGE_KEY);
  if (!raw) {
    memoryLabels = [];
    return memoryLabels;
  }

  try {
    const parsed = JSON.parse(raw) as Label[];
    memoryLabels = Array.isArray(parsed) ? parsed : [];
  } catch {
    memoryLabels = [];
  }

  return memoryLabels;
}

function writeLabels(labels: Label[]): void {
  memoryLabels = labels;
  const storage = getBrowserStorage();
  if (storage) {
    storage.setItem(STORAGE_KEY, JSON.stringify(labels));
  }
}

function createId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }

  return `label_${Date.now()}_${Math.random().toString(36).slice(2)}`;
}

function normalizeLabel(input: CreateLabelInput): Label {
  const now = new Date().toISOString();

  return {
    ...input,
    labelId: input.labelId ?? createId(),
    createdAt: input.createdAt ?? now,
    updatedAt: input.updatedAt ?? now,
  } as Label;
}

function matchesFilter(label: Label, filter?: LabelListFilter): boolean {
  if (!filter) {
    return true;
  }

  return (
    (filter.imageId === undefined || label.imageId === filter.imageId) &&
    (filter.axis === undefined || label.axis === filter.axis) &&
    (filter.source === undefined || label.source === filter.source) &&
    (filter.isGroundTruth === undefined || label.isGroundTruth === filter.isGroundTruth)
  );
}

export const labelStore: LabelStore = {
  async create(input) {
    const label = normalizeLabel(input);
    const labels = readLabels().filter((item) => item.labelId !== label.labelId);
    writeLabels([...labels, label]);
    return label;
  },

  async get(labelId) {
    return readLabels().find((label) => label.labelId === labelId);
  },

  async list(filter) {
    return readLabels().filter((label) => matchesFilter(label, filter));
  },

  async delete(labelId) {
    const labels = readLabels();
    const nextLabels = labels.filter((label) => label.labelId !== labelId);
    writeLabels(nextLabels);
    return nextLabels.length !== labels.length;
  },
};
