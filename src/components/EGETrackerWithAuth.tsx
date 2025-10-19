import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Subject, TaskAttempt } from './ege/types';
import SubjectCard from './ege/SubjectCard';
import AddSubjectDialog from './ege/AddSubjectDialog';
import TaskGrid from './ege/TaskGrid';
import TaskAttemptPanel from './ege/TaskAttemptPanel';
import TaskStatistics from './ege/TaskStatistics';
import { useAuth } from '@/contexts/AuthContext';


const EGETrackerWithAuth = () => {
  const { token, user, logout } = useAuth();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [attempts, setAttempts] = useState<Record<string, TaskAttempt[]>>({});
  const [selectedTasks, setSelectedTasks] = useState<Record<string, number | null>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [showArchived, setShowArchived] = useState(false);

  const [expandedSubject, setExpandedSubject] = useState<string | null>(null);

  useEffect(() => {
    if (token) {
      loadSubjects();
    }
  }, [token]);

  const loadSubjects = async () => {
    try {
      const response = await fetch('https://functions.poehali.dev/68cf2f96-a928-4ff2-af92-8808221d9fed', {
        headers: { 'X-Auth-Token': token! }
      });
      
      if (response.ok) {
        const data = await response.json();
        setSubjects(data);
        
        const attemptsData: Record<string, TaskAttempt[]> = {};
        const selectedData: Record<string, number | null> = {};
        
        for (const subject of data) {
          selectedData[subject.id] = null;
          
          const attemptsResponse = await fetch(
            `https://functions.poehali.dev/75d7b054-d6b3-4c92-9209-927a85acf6eb?subjectId=${subject.id}`,
            { headers: { 'X-Auth-Token': token! } }
          );
          
          if (attemptsResponse.ok) {
            attemptsData[subject.id] = await attemptsResponse.json();
          } else {
            attemptsData[subject.id] = [];
          }
        }
        
        setAttempts(attemptsData);
        setSelectedTasks(selectedData);
      }
    } catch (error) {
      console.error('Failed to load subjects:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddSubject = async (newSubjectData: {
    name: string;
    part1From: number;
    part1To: number;
    part2From: number;
    part2To: number;
    part2MaxPoints: Record<number, number>;
    icon: string;
    color: string;
  }) => {
    try {
      const response = await fetch('https://functions.poehali.dev/68cf2f96-a928-4ff2-af92-8808221d9fed', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-Token': token!
        },
        body: JSON.stringify(newSubjectData)
      });
      
      if (response.ok) {
        const subject = await response.json();
        setSubjects([...subjects, subject]);
        setAttempts({ ...attempts, [subject.id]: [] });
        setSelectedTasks({ ...selectedTasks, [subject.id]: null });
      }
    } catch (error) {
      console.error('Failed to add subject:', error);
    }
  };

  const archiveSubject = async (subjectId: string) => {
    try {
      const subject = subjects.find(s => s.id === subjectId);
      if (!subject) return;

      const response = await fetch(
        `https://functions.poehali.dev/68cf2f96-a928-4ff2-af92-8808221d9fed?id=${subjectId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'X-Auth-Token': token!
          },
          body: JSON.stringify({ archived: !subject.archived })
        }
      );
      
      if (response.ok) {
        setSubjects(subjects.map(s => 
          s.id === subjectId ? { ...s, archived: !s.archived } : s
        ));
      }
    } catch (error) {
      console.error('Failed to archive subject:', error);
    }
  };

  const deleteSubject = async (subjectId: string) => {
    try {
      const response = await fetch(
        `https://functions.poehali.dev/68cf2f96-a928-4ff2-af92-8808221d9fed?id=${subjectId}`,
        {
          method: 'DELETE',
          headers: { 'X-Auth-Token': token! }
        }
      );
      
      if (response.ok) {
        setSubjects(subjects.filter(s => s.id !== subjectId));
        const newAttempts = { ...attempts };
        delete newAttempts[subjectId];
        setAttempts(newAttempts);
        const newSelected = { ...selectedTasks };
        delete newSelected[subjectId];
        setSelectedTasks(newSelected);
        if (expandedSubject === subjectId) {
          setExpandedSubject(null);
        }
      }
    } catch (error) {
      console.error('Failed to delete subject:', error);
    }
  };

  const selectTask = (subjectId: string, taskNumber: number) => {
    setSelectedTasks(prev => ({
      ...prev,
      [subjectId]: prev[subjectId] === taskNumber ? null : taskNumber
    }));
  };

  const saveAttempt = async (
    subjectId: string, 
    taskNumber: number, 
    status: 'completed' | 'failed' | 'skipped', 
    points?: number, 
    maxPoints?: number
  ) => {
    try {
      const response = await fetch('https://functions.poehali.dev/75d7b054-d6b3-4c92-9209-927a85acf6eb', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-Token': token!
        },
        body: JSON.stringify({
          subjectId,
          taskNumber,
          status,
          ...(points !== undefined && { points, maxPoints })
        })
      });
      
      if (response.ok) {
        const attempt = await response.json();
        setAttempts(prev => ({
          ...prev,
          [subjectId]: [...prev[subjectId], attempt]
        }));
        
        setSelectedTasks(prev => ({
          ...prev,
          [subjectId]: null
        }));
      }
    } catch (error) {
      console.error('Failed to save attempt:', error);
    }
  };

  const getTaskStats = (subjectId: string, taskNumber: number) => {
    const subject = subjects.find(s => s.id === subjectId);
    if (!subject) return { percentage: 0, attempts: 0 };

    const isPart2 = taskNumber >= subject.part2Range.from && taskNumber <= subject.part2Range.to;
    const taskAttempts = attempts[subjectId]?.filter(a => a.taskNumber === taskNumber && a.status !== 'skipped') || [];
    
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

  const isPart2Task = (subjectId: string, taskNumber: number) => {
    const subject = subjects.find(s => s.id === subjectId);
    if (!subject) return false;
    return taskNumber >= subject.part2Range.from && taskNumber <= subject.part2Range.to;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Icon name="Loader2" className="animate-spin" size={48} />
      </div>
    );
  }

  const activeSubjects = subjects.filter(s => !s.archived);
  const archivedSubjects = subjects.filter(s => s.archived);
  const displaySubjects = showArchived ? archivedSubjects : activeSubjects;

  return (
    <div className="space-y-6">
      <Card className="border-primary/20 shadow-xl">
        <CardHeader className="bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full blur-sm opacity-40"></div>
                  <div className="relative p-2 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-full">
                    <Icon name="GraduationCap" className="text-white" size={24} />
                  </div>
                </div>
                <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Трекер подготовки к ЕГЭ
                </span>
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1 ml-14">
                {user?.email}
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={logout} size="sm">
                <Icon name="LogOut" size={16} className="mr-2" />
                Выйти
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex gap-2">
              <Button
                variant={!showArchived ? 'default' : 'outline'}
                size="sm"
                onClick={() => setShowArchived(false)}
              >
                Активные ({activeSubjects.length})
              </Button>
              <Button
                variant={showArchived ? 'default' : 'outline'}
                size="sm"
                onClick={() => setShowArchived(true)}
              >
                <Icon name="Archive" size={14} className="mr-2" />
                Корзина ({archivedSubjects.length})
              </Button>
            </div>
            <AddSubjectDialog onAddSubject={handleAddSubject} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
            {displaySubjects.map(subject => (
              <SubjectCard
                key={subject.id}
                subject={subject}
                progress={getSubjectProgress(subject.id)}
                onArchive={archiveSubject}
                onDelete={deleteSubject}
                onClick={() => setExpandedSubject(expandedSubject === subject.id ? null : subject.id)}
              />
            ))}
          </div>

          {displaySubjects.length === 0 && (
            <div className="text-center py-12">
              <Icon 
                name={showArchived ? "Archive" : "BookOpen"} 
                size={64} 
                className="mx-auto text-muted-foreground mb-4" 
              />
              <p className="text-muted-foreground text-lg">
                {showArchived 
                  ? 'Корзина пуста' 
                  : 'Добавьте первый предмет для начала подготовки'}
              </p>
            </div>
          )}

          {expandedSubject && !showArchived && (
            <Card className="mt-6 border-2 border-primary/30">
              <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Icon name="BarChart3" className="text-primary" size={20} />
                    Статистика: {subjects.find(s => s.id === expandedSubject)?.name}
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setExpandedSubject(null)}
                  >
                    <Icon name="X" size={16} />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <TaskStatistics
                  subject={subjects.find(s => s.id === expandedSubject)!}
                  getTaskStats={(taskNumber) => getTaskStats(expandedSubject, taskNumber)}
                  isPart2Task={(taskNumber) => isPart2Task(expandedSubject, taskNumber)}
                />
              </CardContent>
            </Card>
          )}

          {!showArchived && activeSubjects.length > 0 && (
            <Tabs defaultValue={activeSubjects[0]?.id} className="w-full mt-6">
              <TabsList className="grid w-full" style={{ gridTemplateColumns: `repeat(${Math.min(activeSubjects.length, 4)}, 1fr)` }}>
                {activeSubjects.map(subject => (
                  <TabsTrigger key={subject.id} value={subject.id} className="text-xs sm:text-sm">
                    {subject.name.split(' ')[0]}
                  </TabsTrigger>
                ))}
              </TabsList>

              {activeSubjects.map(subject => (
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
                </TabsContent>
              ))}
            </Tabs>
          )}
        </CardContent>
      </Card>


    </div>
  );
};

export default EGETrackerWithAuth;