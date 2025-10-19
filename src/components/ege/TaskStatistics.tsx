import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Subject } from './types';

interface TaskStatisticsProps {
  subject: Subject;
  getTaskStats: (taskNumber: number) => { percentage: number; attempts: number };
  isPart2Task: (taskNumber: number) => boolean;
}

const TaskStatistics = ({ subject, getTaskStats, isPart2Task }: TaskStatisticsProps) => {
  const allTasks = [
    ...Array.from({ length: subject.part1Range.to - subject.part1Range.from + 1 }, (_, i) => subject.part1Range.from + i),
    ...Array.from({ length: subject.part2Range.to - subject.part2Range.from + 1 }, (_, i) => subject.part2Range.from + i)
  ];

  const tasksWithAttempts = allTasks.filter(taskNum => getTaskStats(taskNum).attempts > 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Статистика по заданиям</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {tasksWithAttempts.map(taskNum => {
            const stats = getTaskStats(taskNum);
            const isPart2 = isPart2Task(taskNum);
            return (
              <Card key={taskNum} className="p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">№{taskNum}</span>
                    {isPart2 && <Badge variant="outline" className="text-xs">Ч2</Badge>}
                  </div>
                  <Badge
                    variant={stats.percentage >= 70 ? 'default' : stats.percentage >= 40 ? 'secondary' : 'destructive'}
                  >
                    {stats.percentage}%
                  </Badge>
                </div>
                <Progress value={stats.percentage} className="h-1.5" />
                <p className="text-xs text-muted-foreground mt-1">
                  Попыток: {stats.attempts}
                </p>
              </Card>
            );
          })}
          
          {tasksWithAttempts.length === 0 && (
            <p className="text-sm text-muted-foreground col-span-full text-center py-8">
              Пока нет данных. Начни решать задания!
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TaskStatistics;
