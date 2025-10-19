export interface Subject {
  id: string;
  name: string;
  part1Range: { from: number; to: number };
  part2Range: { from: number; to: number };
  part2MaxPoints: Record<number, number>;
  icon: string;
  color: string;
  archived?: boolean;
}

export interface TaskAttempt {
  taskNumber: number;
  status: 'completed' | 'failed' | 'skipped';
  points?: number;
  maxPoints?: number;
  date: string;
}