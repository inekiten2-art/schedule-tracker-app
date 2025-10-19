import { Subject } from './types';

interface TaskGridProps {
  subject: Subject;
  isPart2: boolean;
  selectedTask: number | null;
  onSelectTask: (taskNumber: number) => void;
  getTaskStats: (taskNumber: number) => { percentage: number; attempts: number };
}

const TaskGrid = ({ subject, isPart2, selectedTask, onSelectTask, getTaskStats }: TaskGridProps) => {
  const range = isPart2 ? subject.part2Range : subject.part1Range;
  const tasks = Array.from({ length: range.to - range.from + 1 }, (_, i) => range.from + i);

  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-sm">
        {isPart2 ? 'Часть 2' : 'Часть 1'} (задания {range.from}–{range.to})
      </h3>
      <div className="grid grid-cols-5 sm:grid-cols-7 md:grid-cols-9 gap-2">
        {tasks.map(taskNum => {
          const stats = getTaskStats(taskNum);
          const isSelected = selectedTask === taskNum;
          
          return (
            <div
              key={taskNum}
              className={`
                relative p-3 rounded-lg border-2 cursor-pointer transition-all text-center
                ${isSelected ? 'border-primary bg-primary/10 scale-105' : 'border-border hover:border-primary/50'}
              `}
              onClick={() => onSelectTask(taskNum)}
            >
              <div className="font-semibold text-sm">{taskNum}</div>
              {stats.attempts > 0 && (
                <div className="text-xs text-muted-foreground mt-1">
                  {stats.percentage}%
                </div>
              )}
              {isPart2 && (
                <div className="text-xs text-muted-foreground">
                  max {subject.part2MaxPoints[taskNum] || 1}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TaskGrid;
