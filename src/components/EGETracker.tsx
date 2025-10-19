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
  totalTasks: number;
  icon: string;
  color: string;
}

interface TaskAttempt {
  taskNumber: number;
  status: 'completed' | 'failed' | 'skipped';
  date: string;
}

const EGETracker = () => {
  const [subjects, setSubjects] = useState<Subject[]>([
    { id: 'math', name: 'Математика', totalTasks: 19, icon: 'Calculator', color: 'bg-blue-500' },
    { id: 'russian', name: 'Русский язык', totalTasks: 27, icon: 'BookOpen', color: 'bg-purple-500' },
    { id: 'physics', name: 'Физика', totalTasks: 26, icon: 'Atom', color: 'bg-green-500' },
    { id: 'informatics', name: 'Информатика', totalTasks: 27, icon: 'Code', color: 'bg-orange-500' }
  ]);

  const [attempts, setAttempts] = useState<Record<string, TaskAttempt[]>>({
    math: [
      { taskNumber: 1, status: 'completed', date: '2025-10-15' },
      { taskNumber: 2, status: 'completed', date: '2025-10-15' },
      { taskNumber: 3, status: 'failed', date: '2025-10-15' },
      { taskNumber: 1, status: 'completed', date: '2025-10-16' },
      { taskNumber: 5, status: 'completed', date: '2025-10-16' }
    ],
    russian: [],
    physics: [],
    informatics: []
  });

  const [selectedTasks, setSelectedTasks] = useState<Record<string, number | null>>({
    math: null,
    russian: null,
    physics: null,
    informatics: null
  });

  const [newSubject, setNewSubject] = useState({ name: '', totalTasks: 20, icon: 'BookOpen', color: 'bg-pink-500' });

  const addSubject = () => {
    if (!newSubject.name.trim()) return;
    
    const id = newSubject.name.toLowerCase().replace(/\s+/g, '-');
    const subject: Subject = {
      id,
      name: newSubject.name,
      totalTasks: newSubject.totalTasks,
      icon: newSubject.icon,
      color: newSubject.color
    };
    
    setSubjects([...subjects, subject]);
    setAttempts({ ...attempts, [id]: [] });
    setSelectedTasks({ ...selectedTasks, [id]: null });
    setNewSubject({ name: '', totalTasks: 20, icon: 'BookOpen', color: 'bg-pink-500' });
  };

  const selectTask = (subjectId: string, taskNumber: number) => {
    setSelectedTasks(prev => ({
      ...prev,
      [subjectId]: prev[subjectId] === taskNumber ? null : taskNumber
    }));
  };

  const saveAttempt = (subjectId: string, taskNumber: number, status: 'completed' | 'failed' | 'skipped') => {
    const today = new Date().toISOString().split('T')[0];
    const newAttempt: TaskAttempt = {
      taskNumber,
      status,
      date: today
    };

    setAttempts(prev => ({
      ...prev,
      [subjectId]: [...prev[subjectId], newAttempt]
    }));

    setSelectedTasks(prev => ({
      ...prev,
      [subjectId]: null
    }));
  };

  const getTaskStats = (subjectId: string, taskNumber: number) => {
    const taskAttempts = attempts[subjectId].filter(a => a.taskNumber === taskNumber && a.status !== 'skipped');
    const completed = taskAttempts.filter(a => a.status === 'completed').length;
    const total = taskAttempts.length;
    
    if (total === 0) return { percentage: 0, attempts: 0 };
    
    return {
      percentage: Math.round((completed / total) * 100),
      attempts: total
    };
  };

  const getSubjectProgress = (subjectId: string) => {
    const subject = subjects.find(s => s.id === subjectId);
    if (!subject) return 0;

    const taskNumbers = Array.from({ length: subject.totalTasks }, (_, i) => i + 1);
    
    const allAttempts = taskNumbers.map(num => {
      const taskAttempts = attempts[subjectId].filter(a => a.taskNumber === num && a.status !== 'skipped');
      if (taskAttempts.length === 0) return null;
      
      const completed = taskAttempts.filter(a => a.status === 'completed').length;
      return (completed / taskAttempts.length) * 100;
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
              <DialogContent>
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
                  <div>
                    <Label>Количество заданий в экзамене</Label>
                    <Input
                      type="number"
                      value={newSubject.totalTasks}
                      onChange={(e) => setNewSubject({ ...newSubject, totalTasks: parseInt(e.target.value) || 0 })}
                    />
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
                        <p className="text-xs text-muted-foreground">{subject.totalTasks} заданий</p>
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
            <TabsList className={`grid w-full grid-cols-${Math.min(subjects.length, 4)}`}>
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
                  <CardContent>
                    <div className="grid grid-cols-5 sm:grid-cols-7 md:grid-cols-9 gap-2">
                      {Array.from({ length: subject.totalTasks }, (_, i) => i + 1).map(taskNum => {
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
                          </div>
                        );
                      })}
                    </div>

                    {selectedTasks[subject.id] !== null && (
                      <div className="mt-6 p-4 border-2 border-primary/30 rounded-lg bg-primary/5">
                        <p className="text-sm font-medium mb-3">
                          Задание {selectedTasks[subject.id]} — как решилось?
                        </p>
                        <div className="flex items-center gap-2">
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
                      {Array.from({ length: subject.totalTasks }, (_, i) => i + 1)
                        .filter(taskNum => getTaskStats(subject.id, taskNum).attempts > 0)
                        .map(taskNum => {
                          const stats = getTaskStats(subject.id, taskNum);
                          return (
                            <Card key={taskNum} className="p-3">
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-semibold">Задание {taskNum}</span>
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
                      
                      {Array.from({ length: subject.totalTasks }, (_, i) => i + 1)
                        .filter(taskNum => getTaskStats(subject.id, taskNum).attempts > 0).length === 0 && (
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
