import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import Icon from '@/components/ui/icon';
import { Subject } from './types';

interface SubjectCardProps {
  subject: Subject;
  progress: number;
  onDelete: (id: string) => void;
}

const SubjectCard = ({ subject, progress, onDelete }: SubjectCardProps) => {
  const totalTasks = subject.part1Range.to - subject.part1Range.from + 1 + subject.part2Range.to - subject.part2Range.from + 1;

  return (
    <Card className="border-2 hover:border-primary/30 transition-all">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 ${subject.color} rounded-lg flex items-center justify-center`}>
              <Icon name={subject.icon as any} size={20} className="text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-sm">{subject.name}</h3>
              <p className="text-xs text-muted-foreground">
                {totalTasks} заданий
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={() => onDelete(subject.id)}
          >
            <Icon name="Trash2" size={14} />
          </Button>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Прогресс</span>
            <span className="font-bold text-primary">{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </CardContent>
    </Card>
  );
};

export default SubjectCard;
