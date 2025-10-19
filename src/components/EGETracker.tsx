import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface Subject {
  id: string;
  name: string;
  part1Range: { from: number; to: number };
  part2Range: { from: number; to: number };
  part2MaxPoints: Record<number, number>;
  icon: string;
  color: string;
}

interface TaskAttempt {
  taskNumber: number;
  status: 'completed' | 'failed' | 'skipped';
  points?: number;
  maxPoints?: number;
  date: string;
}

const EGETracker = () => {
  const [subjects, setSubjects] = useState<Subject[]>([
    { 
      id: 'math', 
      name: 'Математика', 
      part1Range: { from: 1, to: 12 },
      part2Range: { from: 13, to: 19 },
      part2MaxPoints: { 13: 2, 14: 2, 15: 2, 16: 3, 17: 3, 18: 4, 19: 4 },
      icon: 'Calculator', 
      color: 'bg-blue-500' 
    },
    { 
      id: 'russian', 
      name: 'Русский язык', 
      part1Range: { from: 1, to: 26 },
      part2Range: { from: 27, to: 27 },
      part2MaxPoints: { 27: 24 },
      icon: 'BookOpen', 
      color: 'bg-purple-500' 
    }
  ]);

  const [attempts, setAttempts] = useState<Record<string, TaskAttempt[]>>({
    math: [
      { taskNumber: 1, status: 'completed', date: '2025-10-15' },
      { taskNumber: 2, status: 'completed', date: '2025-10-15' },
      { taskNumber: 3, status: 'failed', date: '2025-10-15' },
      { taskNumber: 13, status: 'completed', points: 2, maxPoints: 2, date: '2025-10-16' },
      { taskNumber: 19, status: 'completed', points: 2, maxPoints: 4, date: '2025-10-16' }
    ],
    russian: []
  });

  const [selectedTasks, setSelectedTasks] = useState<Record<string, number | null>>({
    math: null,
    russian: null
  });

  const [part2Points, setPart2Points] = useState<number>(0);

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

  const addSubject = () => {
    if (!newSubject.name.trim()) return;
    
    const id = newSubject.name.toLowerCase().replace(/\s+/g, '-');
    const subject: Subject = {
      id,
      name: newSubject.name,
      part1Range: { from: newSubject.part1From, to: newSubject.part1To },
      part2Range: { from: newSubject.part2From, to: newSubject.part2To },
      part2MaxPoints: part2PointsConfig,
      icon: newSubject.icon,
      color: newSubject.color
    };
    
    setSubjects([...subjects, subject]);
    setAttempts({ ...attempts, [id]: [] });
    setSelectedTasks({ ...selectedTasks, [id]: null });
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

  const selectTask = (subjectId: string, taskNumber: number) => {
    setSelectedTasks(prev => ({
      ...prev,
      [subjectId]: prev[subjectId] === taskNumber ? null : taskNumber
    }));
    setPart2Points(0);
  };

  const saveAttempt = (subjectId: string, taskNumber: number, status: 'completed' | 'failed' | 'skipped', points?: number, maxPoints?: number) => {
    const today = new Date().toISOString().split('T')[0];
    const newAttempt: TaskAttempt = {
      taskNumber,
      status,
      date: today,
      ...(points !== undefined && { points, maxPoints })
    };

    setAttempts(prev => ({
      ...prev,
      [subjectId]: [...prev[subjectId], newAttempt]
    }));

    setSelectedTasks(prev => ({
      ...prev,
      [subjectId]: null
    }));
    setPart2Points(0);
  };

  const getTaskStats = (subjectId: string, taskNumber: number) => {
    const subject = subjects.find(s => s.id === subjectId);
    if (!subject) return { percentage: 0, attempts: 0 };

    const isPart2 = taskNumber >= subject.part2Range.from && taskNumber <= subject.part2Range.to;
    const taskAttempts = attempts[subjectId].filter(a => a.taskNumber === taskNumber && a.status !== 'skipped');
    
    if (taskAttempts.length === 0) return { percentage: 0, attempts: 0 };

    let percentage: number;
    
    if (isPart2) {
      const totalPoints = taskAttempts.reduce((sum, a) => sum + (a.points || 0), 0);
      const totalMaxPoints = taskAttempts.reduce((sum, a) => sum + (a.maxPoints || 1), 0);
      percentage = Math.round((totalPoints / totalMaxPoints) * 100);
    } else {
      const completed = taskAttempts.filter(a => a.status === 'completed').length;
      percentage = Math.round((completed / taskAttempts.length) * 100);
    }
    
    return {
      percentage,
      attempts: taskAttempts.length
    };
  };

  const getSubjectProgress = (subjectId: string) => {
    const subject = subjects.find(s => s.id === subjectId);
    if (!subject) return 0;

    const allTaskNumbers = [
      ...Array.from({ length: subject.part1Range.to - subject.part1Range.from + 1 }, (_, i) => subject.part1Range.from + i),
      ...Array.from({ length: subject.part2Range.to - subject.part2Range.from + 1 }, (_, i) => subject.part2Range.from + i)
    ];
    
    const allAttempts = allTaskNumbers.map(num => {
      const stats = getTaskStats(subjectId, num);
      return stats.attempts > 0 ? stats.percentage : null;
    }).filter(p => p !== null) as number[];
    
    if (allAttempts.length === 0) return 0;
    
    return Math.round(allAttempts.reduce((a, b) => a + b, 0) / allAttempts.length);
  };

  const deleteSubject = (subjectId: string) => {
    setSubjects(subjects.filter(s => s.id !== subjectId));
    const newAttempts = { ...attempts };
    delete newAttempts[subjectId];
    setAttempts(newAttempts);
    const newSelected = { ...selectedTasks };
    delete newSelected[subjectId];
    setSelectedTasks(newSelected);
  };

  const isPart2Task = (subjectId: string, taskNumber: number) => {
    const subject = subjects.find(s => s.id === subjectId);
    if (!subject) return false;
    return taskNumber >= subject.part2Range.from && taskNumber <= subject.part2Range.to;
  };

  const renderTaskGrid = (subject: Subject, isPart2: boolean) => {
    const range = isPart2 ? subject.part2Range : subject.part1Range;
    const tasks = Array.from({ length: range.to - range.from + 1 }, (_, i) => range.from + i);

    return (
      <div className="space-y-3">
        <h3 className="font-semibold text-sm">
          {isPart2 ? 'Часть 2' : 'Часть 1'} (задания {range.from}–{range.to})
        </h3>
        <div className="grid grid-cols-5 sm:grid-cols-7 md:grid-cols-9 gap-2">
          {tasks.map(taskNum => {
            const stats = getTaskStats(subject.id, taskNum);
            const isSelected = selectedTasks[subject.id] === taskNum;
            
            return (
              <div
                key={taskNum}
                className={`
                  relative p-3 rounded-lg border-2 cursor-pointer transition-all text-center
                  ${isSelected ? 'border-primary bg-primary/10 scale-105' : 'border-border hover:border-primary/50'}
                `}
                onClick={() => selectTask(subject.id, taskNum)}
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

  return (
    <div className="space-y-6">
      <Card className="border-primary/20 shadow-xl">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Icon name="GraduationCap" className="text-primary" size={28} />
              Трекер подготовки к ЕГЭ
            </CardTitle>
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

                  <Button onClick={addSubject} className="w-full">
                    Добавить предмет
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {subjects.map(subject => (
              <Card key={subject.id} className="border-2 hover:border-primary/30 transition-all">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 ${subject.color} rounded-lg flex items-center justify-center`}>
                        <Icon name={subject.icon as any} size={20} className="text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-sm">{subject.name}</h3>
                        <p className="text-xs text-muted-foreground">
                          {subject.part1Range.to - subject.part1Range.from + 1 + subject.part2Range.to - subject.part2Range.from + 1} заданий
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => deleteSubject(subject.id)}
                    >
                      <Icon name="Trash2" size={14} />
                    </Button>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Прогресс</span>
                      <span className="font-bold text-primary">{getSubjectProgress(subject.id)}%</span>
                    </div>
                    <Progress value={getSubjectProgress(subject.id)} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Tabs defaultValue={subjects[0]?.id} className="w-full">
            <TabsList className="grid w-full" style={{ gridTemplateColumns: `repeat(${Math.min(subjects.length, 4)}, 1fr)` }}>
              {subjects.map(subject => (
                <TabsTrigger key={subject.id} value={subject.id} className="text-xs sm:text-sm">
                  {subject.name.split(' ')[0]}
                </TabsTrigger>
              ))}
            </TabsList>

            {subjects.map(subject => (
              <TabsContent key={subject.id} value={subject.id} className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Выбери задание</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {renderTaskGrid(subject, false)}
                    {renderTaskGrid(subject, true)}

                    {selectedTasks[subject.id] !== null && (
                      <div className="mt-6 p-4 border-2 border-primary/30 rounded-lg bg-primary/5">
                        <p className="text-sm font-medium mb-3">
                          Задание {selectedTasks[subject.id]} — как решилось?
                        </p>
                        
                        {isPart2Task(subject.id, selectedTasks[subject.id]!) && (
                          <div className="mb-3">
                            <Label className="text-xs">Баллов набрано (макс: {subject.part2MaxPoints[selectedTasks[subject.id]!] || 1})</Label>
                            <Input
                              type="number"
                              min="0"
                              max={subject.part2MaxPoints[selectedTasks[subject.id]!] || 1}
                              value={part2Points}
                              onChange={(e) => setPart2Points(parseInt(e.target.value) || 0)}
                              className="mt-1"
                            />
                          </div>
                        )}
                        
                        <div className="flex items-center gap-2">
                          {isPart2Task(subject.id, selectedTasks[subject.id]!) ? (
                            <>
                              <Button
                                onClick={() => saveAttempt(
                                  subject.id, 
                                  selectedTasks[subject.id]!, 
                                  'completed',
                                  part2Points,
                                  subject.part2MaxPoints[selectedTasks[subject.id]!]
                                )}
                                className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                                disabled={part2Points === 0}
                              >
                                <Icon name="Check" size={16} className="mr-2" />
                                Сохранить
                              </Button>
                              <Button
                                onClick={() => saveAttempt(subject.id, selectedTasks[subject.id]!, 'skipped')}
                                className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white"
                              >
                                <Icon name="Minus" size={16} className="mr-2" />
                                Пропустил
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button
                                onClick={() => saveAttempt(subject.id, selectedTasks[subject.id]!, 'completed')}
                                className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                              >
                                <Icon name="Check" size={16} className="mr-2" />
                                Решил
                              </Button>
                              <Button
                                onClick={() => saveAttempt(subject.id, selectedTasks[subject.id]!, 'failed')}
                                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                              >
                                <Icon name="X" size={16} className="mr-2" />
                                Не решил
                              </Button>
                              <Button
                                onClick={() => saveAttempt(subject.id, selectedTasks[subject.id]!, 'skipped')}
                                className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white"
                              >
                                <Icon name="Minus" size={16} className="mr-2" />
                                Пропустил
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Статистика по заданиям</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {[
                        ...Array.from({ length: subject.part1Range.to - subject.part1Range.from + 1 }, (_, i) => subject.part1Range.from + i),
                        ...Array.from({ length: subject.part2Range.to - subject.part2Range.from + 1 }, (_, i) => subject.part2Range.from + i)
                      ]
                        .filter(taskNum => getTaskStats(subject.id, taskNum).attempts > 0)
                        .map(taskNum => {
                          const stats = getTaskStats(subject.id, taskNum);
                          const isPart2 = isPart2Task(subject.id, taskNum);
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
                      
                      {[
                        ...Array.from({ length: subject.part1Range.to - subject.part1Range.from + 1 }, (_, i) => subject.part1Range.from + i),
                        ...Array.from({ length: subject.part2Range.to - subject.part2Range.from + 1 }, (_, i) => subject.part2Range.from + i)
                      ].filter(taskNum => getTaskStats(subject.id, taskNum).attempts > 0).length === 0 && (
                        <p className="text-sm text-muted-foreground col-span-full text-center py-8">
                          Пока нет данных. Начни решать задания!
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default EGETracker;
