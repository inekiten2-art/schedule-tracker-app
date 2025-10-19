import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Subject {
  id: string;
  name: string;
  totalTasks: number;
  icon: string;
  color: string;
}

const SUBJECTS: Subject[] = [
  { id: 'math', name: 'Математика', totalTasks: 19, icon: 'Calculator', color: 'bg-blue-500' },
  { id: 'russian', name: 'Русский язык', totalTasks: 27, icon: 'BookOpen', color: 'bg-purple-500' },
  { id: 'physics', name: 'Физика', totalTasks: 26, icon: 'Atom', color: 'bg-green-500' },
  { id: 'informatics', name: 'Информатика', totalTasks: 27, icon: 'Code', color: 'bg-orange-500' }
];

interface TaskAttempt {
  taskNumber: number;
  completed: boolean;
  date: string;
}

const EGETracker = () => {
  const [attempts, setAttempts] = useState<Record<string, TaskAttempt[]>>({
    math: [
      { taskNumber: 1, completed: true, date: '2025-10-15' },
      { taskNumber: 2, completed: true, date: '2025-10-15' },
      { taskNumber: 3, completed: false, date: '2025-10-15' },
      { taskNumber: 1, completed: true, date: '2025-10-16' },
      { taskNumber: 5, completed: true, date: '2025-10-16' }
    ],
    russian: [],
    physics: [],
    informatics: []
  });

  const [currentSession, setCurrentSession] = useState<Record<string, Set<number>>>({
    math: new Set(),
    russian: new Set(),
    physics: new Set(),
    informatics: new Set()
  });

  const toggleTask = (subjectId: string, taskNumber: number) => {
    setCurrentSession(prev => {
      const newSession = { ...prev };
      const taskSet = new Set(newSession[subjectId]);
      
      if (taskSet.has(taskNumber)) {
        taskSet.delete(taskNumber);
      } else {
        taskSet.add(taskNumber);
      }
      
      newSession[subjectId] = taskSet;
      return newSession;
    });
  };

  const saveSession = (subjectId: string) => {
    const tasks = Array.from(currentSession[subjectId]);
    if (tasks.length === 0) return;

    const today = new Date().toISOString().split('T')[0];
    const newAttempts = tasks.map(taskNumber => ({
      taskNumber,
      completed: true,
      date: today
    }));

    setAttempts(prev => ({
      ...prev,
      [subjectId]: [...prev[subjectId], ...newAttempts]
    }));

    setCurrentSession(prev => ({
      ...prev,
      [subjectId]: new Set()
    }));
  };

  const getTaskStats = (subjectId: string, taskNumber: number) => {
    const taskAttempts = attempts[subjectId].filter(a => a.taskNumber === taskNumber);
    const completed = taskAttempts.filter(a => a.completed).length;
    const total = taskAttempts.length;
    
    if (total === 0) return { percentage: 0, attempts: 0 };
    
    return {
      percentage: Math.round((completed / total) * 100),
      attempts: total
    };
  };

  const getSubjectProgress = (subjectId: string) => {
    const subject = SUBJECTS.find(s => s.id === subjectId)!;
    const taskNumbers = Array.from({ length: subject.totalTasks }, (_, i) => i + 1);
    
    const percentages = taskNumbers
      .map(num => getTaskStats(subjectId, num).percentage)
      .filter(p => p > 0);
    
    if (percentages.length === 0) return 0;
    
    return Math.round(percentages.reduce((a, b) => a + b, 0) / percentages.length);
  };

  return (
    <div className="space-y-6">
      <Card className="border-primary/20 shadow-xl">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10">
          <CardTitle className="flex items-center gap-2">
            <Icon name="GraduationCap" className="text-primary" size={28} />
            Трекер подготовки к ЕГЭ
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {SUBJECTS.map(subject => (
              <Card key={subject.id} className="border-2 hover:border-primary/30 transition-all">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-10 h-10 ${subject.color} rounded-lg flex items-center justify-center`}>
                      <Icon name={subject.icon as any} size={20} className="text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-sm">{subject.name}</h3>
                      <p className="text-xs text-muted-foreground">{subject.totalTasks} заданий</p>
                    </div>
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

          <Tabs defaultValue="math" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              {SUBJECTS.map(subject => (
                <TabsTrigger key={subject.id} value={subject.id} className="text-xs sm:text-sm">
                  {subject.name.split(' ')[0]}
                </TabsTrigger>
              ))}
            </TabsList>

            {SUBJECTS.map(subject => (
              <TabsContent key={subject.id} value={subject.id} className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Отметь выполненные задания</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-5 sm:grid-cols-7 md:grid-cols-9 gap-2 mb-4">
                      {Array.from({ length: subject.totalTasks }, (_, i) => i + 1).map(taskNum => {
                        const stats = getTaskStats(subject.id, taskNum);
                        const isSelected = currentSession[subject.id].has(taskNum);
                        
                        return (
                          <div
                            key={taskNum}
                            className={`
                              relative p-3 rounded-lg border-2 cursor-pointer transition-all text-center
                              ${isSelected ? 'border-primary bg-primary/10 scale-105' : 'border-border hover:border-primary/50'}
                            `}
                            onClick={() => toggleTask(subject.id, taskNum)}
                          >
                            <div className="font-semibold text-sm">{taskNum}</div>
                            {stats.attempts > 0 && (
                              <div className="text-xs text-muted-foreground mt-1">
                                {stats.percentage}%
                              </div>
                            )}
                            {isSelected && (
                              <div className="absolute -top-1 -right-1">
                                <div className="bg-primary rounded-full p-0.5">
                                  <Icon name="Check" size={12} className="text-primary-foreground" />
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {currentSession[subject.id].size > 0 && (
                      <div className="flex items-center gap-3">
                        <Badge variant="secondary" className="text-sm">
                          Выбрано: {currentSession[subject.id].size}
                        </Badge>
                        <Button
                          onClick={() => saveSession(subject.id)}
                          className="bg-secondary hover:bg-secondary/90"
                        >
                          <Icon name="Save" size={16} className="mr-2" />
                          Сохранить попытку
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Детальная статистика</CardTitle>
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
