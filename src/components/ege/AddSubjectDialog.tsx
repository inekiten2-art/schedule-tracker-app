import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface AddSubjectDialogProps {
  onAddSubject: (subject: {
    name: string;
    part1From: number;
    part1To: number;
    part2From: number;
    part2To: number;
    part2MaxPoints: Record<number, number>;
    icon: string;
    color: string;
  }) => void;
}

const AddSubjectDialog = ({ onAddSubject }: AddSubjectDialogProps) => {
  const [newSubject, setNewSubject] = useState({ 
    name: '', 
    part1From: 1,
    part1To: 12,
    part2From: 13,
    part2To: 19,
    icon: 'BookOpen', 
    color: 'bg-pink-500' 
  });

  const [part2PointsConfig, setPart2PointsConfig] = useState<Record<number, number>>({});

  const handleAdd = () => {
    if (!newSubject.name.trim()) return;
    
    onAddSubject({
      ...newSubject,
      part2MaxPoints: part2PointsConfig
    });

    setNewSubject({ 
      name: '', 
      part1From: 1,
      part1To: 12,
      part2From: 13,
      part2To: 19,
      icon: 'BookOpen', 
      color: 'bg-pink-500' 
    });
    setPart2PointsConfig({});
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <Icon name="Plus" size={16} className="mr-2" />
          Добавить предмет
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Новый предмет</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          <div>
            <Label>Название предмета</Label>
            <Input
              placeholder="Например: Биология"
              value={newSubject.name}
              onChange={(e) => setNewSubject({ ...newSubject, name: e.target.value })}
            />
          </div>
          
          <div className="border-t pt-4">
            <Label className="text-base font-semibold">Часть 1 (тестовая)</Label>
            <div className="grid grid-cols-2 gap-3 mt-2">
              <div>
                <Label className="text-xs">С задания</Label>
                <Input
                  type="number"
                  value={newSubject.part1From}
                  onChange={(e) => setNewSubject({ ...newSubject, part1From: parseInt(e.target.value) || 1 })}
                />
              </div>
              <div>
                <Label className="text-xs">По задание</Label>
                <Input
                  type="number"
                  value={newSubject.part1To}
                  onChange={(e) => setNewSubject({ ...newSubject, part1To: parseInt(e.target.value) || 12 })}
                />
              </div>
            </div>
          </div>

          <div className="border-t pt-4">
            <Label className="text-base font-semibold">Часть 2 (развернутые ответы)</Label>
            <div className="grid grid-cols-2 gap-3 mt-2">
              <div>
                <Label className="text-xs">С задания</Label>
                <Input
                  type="number"
                  value={newSubject.part2From}
                  onChange={(e) => setNewSubject({ ...newSubject, part2From: parseInt(e.target.value) || 13 })}
                />
              </div>
              <div>
                <Label className="text-xs">По задание</Label>
                <Input
                  type="number"
                  value={newSubject.part2To}
                  onChange={(e) => setNewSubject({ ...newSubject, part2To: parseInt(e.target.value) || 19 })}
                />
              </div>
            </div>
            
            <div className="mt-3">
              <Label className="text-xs">Максимальные баллы за задания части 2</Label>
              <div className="grid grid-cols-3 gap-2 mt-2">
                {Array.from({ length: newSubject.part2To - newSubject.part2From + 1 }, (_, i) => newSubject.part2From + i).map(taskNum => (
                  <div key={taskNum} className="flex items-center gap-2">
                    <Label className="text-xs whitespace-nowrap">№{taskNum}:</Label>
                    <Input
                      type="number"
                      min="1"
                      max="24"
                      placeholder="балл"
                      className="h-8"
                      value={part2PointsConfig[taskNum] || ''}
                      onChange={(e) => setPart2PointsConfig({
                        ...part2PointsConfig,
                        [taskNum]: parseInt(e.target.value) || 1
                      })}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div>
            <Label>Цвет</Label>
            <select
              className="w-full p-2 border rounded-md"
              value={newSubject.color}
              onChange={(e) => setNewSubject({ ...newSubject, color: e.target.value })}
            >
              <option value="bg-blue-500">Синий</option>
              <option value="bg-purple-500">Фиолетовый</option>
              <option value="bg-green-500">Зелёный</option>
              <option value="bg-orange-500">Оранжевый</option>
              <option value="bg-pink-500">Розовый</option>
              <option value="bg-red-500">Красный</option>
              <option value="bg-yellow-500">Жёлтый</option>
              <option value="bg-teal-500">Бирюзовый</option>
            </select>
          </div>

          <Button onClick={handleAdd} className="w-full">
            Добавить предмет
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddSubjectDialog;
