import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Subject, TaskAttempt } from './ege/types';
import SubjectCard from './ege/SubjectCard';
import AddSubjectDialog from './ege/AddSubjectDialog';
import TaskGrid from './ege/TaskGrid';
import TaskAttemptPanel from './ege/TaskAttemptPanel';
import TaskStatistics from './ege/TaskStatistics';

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

  const handleAddSubject = (newSubjectData: {
    name: string;
    part1From: number;
    part1To: number;
    part2From: number;
    part2To: number;
    part2MaxPoints: Record<number, number>;
    icon: string;
    color: string;
  }) => {
    const id = newSubjectData.name.toLowerCase().replace(/\s+/g, '-');
    const subject: Subject = {
      id,
      name: newSubjectData.name,
      part1Range: { from: newSubjectData.part1From, to: newSubjectData.part1To },
      part2Range: { from: newSubjectData.part2From, to: newSubjectData.part2To },
      part2MaxPoints: newSubjectData.part2MaxPoints,
      icon: newSubjectData.icon,
      color: newSubjectData.color
    };
    
    setSubjects([...subjects, subject]);
    setAttempts({ ...attempts, [id]: [] });
    setSelectedTasks({ ...selectedTasks, [id]: null });
  };

  const selectTask = (subjectId: string, taskNumber: number) => {
    setSelectedTasks(prev => ({
      ...prev,
      [subjectId]: prev[subjectId] === taskNumber ? null : taskNumber
    }));
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

  return (
    <div className="space-y-6">
      <Card className="border-primary/20 shadow-xl">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Icon name="GraduationCap" className="text-primary" size={28} />
              Трекер подготовки к ЕГЭ
            </CardTitle>
            <AddSubjectDialog onAddSubject={handleAddSubject} />
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {subjects.map(subject => (
              <SubjectCard
                key={subject.id}
                subject={subject}
                progress={getSubjectProgress(subject.id)}
                onDelete={deleteSubject}
              />
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
                    <TaskGrid
                      subject={subject}
                      isPart2={false}
                      selectedTask={selectedTasks[subject.id]}
                      onSelectTask={(taskNumber) => selectTask(subject.id, taskNumber)}
                      getTaskStats={(taskNumber) => getTaskStats(subject.id, taskNumber)}
                    />
                    <TaskGrid
                      subject={subject}
                      isPart2={true}
                      selectedTask={selectedTasks[subject.id]}
                      onSelectTask={(taskNumber) => selectTask(subject.id, taskNumber)}
                      getTaskStats={(taskNumber) => getTaskStats(subject.id, taskNumber)}
                    />

                    {selectedTasks[subject.id] !== null && (
                      <TaskAttemptPanel
                        subject={subject}
                        taskNumber={selectedTasks[subject.id]!}
                        isPart2={isPart2Task(subject.id, selectedTasks[subject.id]!)}
                        onSaveAttempt={(status, points, maxPoints) => 
                          saveAttempt(subject.id, selectedTasks[subject.id]!, status, points, maxPoints)
                        }
                      />
                    )}
                  </CardContent>
                </Card>

                <TaskStatistics
                  subject={subject}
                  getTaskStats={(taskNumber) => getTaskStats(subject.id, taskNumber)}
                  isPart2Task={(taskNumber) => isPart2Task(subject.id, taskNumber)}
                />
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default EGETracker;
