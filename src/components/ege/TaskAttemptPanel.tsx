import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import { Subject } from './types';

interface TaskAttemptPanelProps {
  subject: Subject;
  taskNumber: number;
  isPart2: boolean;
  onSaveAttempt: (status: 'completed' | 'failed' | 'skipped', points?: number, maxPoints?: number) => void;
}

const TaskAttemptPanel = ({ subject, taskNumber, isPart2, onSaveAttempt }: TaskAttemptPanelProps) => {
  const [points, setPoints] = useState<number>(0);
  const maxPoints = isPart2 ? (subject.part2MaxPoints[taskNumber] || 1) : 1;

  const handleSave = (status: 'completed' | 'failed' | 'skipped') => {
    if (isPart2 && status === 'completed') {
      onSaveAttempt(status, points, maxPoints);
    } else {
      onSaveAttempt(status);
    }
    setPoints(0);
  };

  return (
    <div className="mt-6 p-4 border-2 border-primary/30 rounded-lg bg-primary/5">
      <p className="text-sm font-medium mb-3">
        Задание {taskNumber} — как решилось?
      </p>
      
      {isPart2 && (
        <div className="mb-3">
          <Label className="text-xs">Баллов набрано (макс: {maxPoints})</Label>
          <Input
            type="number"
            min="0"
            max={maxPoints}
            value={points}
            onChange={(e) => setPoints(parseInt(e.target.value) || 0)}
            className="mt-1"
          />
        </div>
      )}
      
      <div className="flex items-center gap-2">
        {isPart2 ? (
          <>
            <Button
              onClick={() => handleSave('completed')}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
              disabled={points === 0}
            >
              <Icon name="Check" size={16} className="mr-2" />
              Сохранить
            </Button>
            <Button
              onClick={() => handleSave('skipped')}
              className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white"
            >
              <Icon name="Minus" size={16} className="mr-2" />
              Пропустил
            </Button>
          </>
        ) : (
          <>
            <Button
              onClick={() => handleSave('completed')}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
            >
              <Icon name="Check" size={16} className="mr-2" />
              Решил
            </Button>
            <Button
              onClick={() => handleSave('failed')}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white"
            >
              <Icon name="X" size={16} className="mr-2" />
              Не решил
            </Button>
            <Button
              onClick={() => handleSave('skipped')}
              className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white"
            >
              <Icon name="Minus" size={16} className="mr-2" />
              Пропустил
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default TaskAttemptPanel;
