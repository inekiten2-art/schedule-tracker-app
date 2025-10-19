import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import Icon from '@/components/ui/icon';
import { useAuth } from '@/contexts/AuthContext';

interface Subject {
  id: string;
  name: string;
  color: string;
}

const Statistics = () => {
  const { token } = useAuth();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [subjectsProgress, setSubjectsProgress] = useState<Record<string, number>>({});

  const weeklyData = [
    { day: 'Пн', completed: 0, total: 0 },
    { day: 'Вт', completed: 0, total: 0 },
    { day: 'Ср', completed: 0, total: 0 },
    { day: 'Чт', completed: 0, total: 0 },
    { day: 'Пт', completed: 0, total: 0 },
    { day: 'Сб', completed: 0, total: 0 },
    { day: 'Вс', completed: 0, total: 0 }
  ];

  const totalCompleted = weeklyData.reduce((sum, day) => sum + day.completed, 0);
  const totalTasks = weeklyData.reduce((sum, day) => sum + day.total, 0);
  const completionRate = totalTasks > 0 ? Math.round((totalCompleted / totalTasks) * 100) : 0;

  useEffect(() => {
    if (token) {
      loadSubjectsAndProgress();
    }
  }, [token]);

  const loadSubjectsAndProgress = async () => {
    try {
      const response = await fetch('https://functions.poehali.dev/68cf2f96-a928-4ff2-af92-8808221d9fed', {
        headers: { 'X-Auth-Token': token! }
      });
      
      if (response.ok) {
        const data = await response.json();
        const activeSubjects = data.filter((s: any) => !s.archived);
        setSubjects(activeSubjects);
        
        const progressData: Record<string, number> = {};
        
        for (const subject of activeSubjects) {
          const attemptsResponse = await fetch(
            `https://functions.poehali.dev/75d7b054-d6b3-4c92-9209-927a85acf6eb?subjectId=${subject.id}`,
            { headers: { 'X-Auth-Token': token! } }
          );
          
          if (attemptsResponse.ok) {
            const attempts = await attemptsResponse.json();
            const progress = calculateSubjectProgress(subject, attempts);
            progressData[subject.id] = progress;
          } else {
            progressData[subject.id] = 0;
          }
        }
        
        setSubjectsProgress(progressData);
      }
    } catch (error) {
      console.error('Failed to load subjects:', error);
    }
  };

  const calculateSubjectProgress = (subject: any, attempts: any[]) => {
    const allTaskNumbers = [
      ...Array.from({ length: subject.part1Range.to - subject.part1Range.from + 1 }, (_, i) => subject.part1Range.from + i),
      ...Array.from({ length: subject.part2Range.to - subject.part2Range.from + 1 }, (_, i) => subject.part2Range.from + i)
    ];
    
    const taskStats = allTaskNumbers.map(taskNum => {
      const isPart2 = taskNum >= subject.part2Range.from && taskNum <= subject.part2Range.to;
      const taskAttempts = attempts.filter((a: any) => a.taskNumber === taskNum && a.status !== 'skipped');
      
      if (taskAttempts.length === 0) return null;

      let percentage: number;
      
      if (isPart2) {
        const totalPoints = taskAttempts.reduce((sum: number, a: any) => sum + (a.points || 0), 0);
        const totalMaxPoints = taskAttempts.reduce((sum: number, a: any) => sum + (a.maxPoints || 1), 0);
        percentage = Math.round((totalPoints / totalMaxPoints) * 100);
      } else {
        const completed = taskAttempts.filter((a: any) => a.status === 'completed').length;
        percentage = Math.round((completed / taskAttempts.length) * 100);
      }
      
      return percentage;
    }).filter(p => p !== null) as number[];
    
    if (taskStats.length === 0) return 0;
    
    return Math.round(taskStats.reduce((a, b) => a + b, 0) / taskStats.length);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-primary/20 shadow-lg">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <Icon name="Target" className="text-primary" size={24} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Выполнено задач</p>
                <p className="text-2xl font-bold">{totalCompleted}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-secondary/20 shadow-lg">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center">
                <Icon name="TrendingUp" className="text-secondary" size={24} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Процент выполнения</p>
                <p className="text-2xl font-bold">{completionRate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-accent/20 shadow-lg">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center">
                <Icon name="Flame" className="text-accent" size={24} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Текущий стрик</p>
                <p className="text-2xl font-bold">0 дней</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-primary/20 shadow-xl">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10">
          <CardTitle className="flex items-center gap-2">
            <Icon name="BarChart3" className="text-primary" size={28} />
            Активность за неделю
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {weeklyData.map((day, index) => {
              const percentage = day.total > 0 ? (day.completed / day.total) * 100 : 0;
              return (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm">{day.day}</span>
                    <span className="text-sm text-muted-foreground">
                      {day.completed}/{day.total}
                    </span>
                  </div>
                  <div className="relative">
                    <Progress value={percentage} className="h-3" />
                    <div
                      className="absolute top-0 left-0 h-3 rounded-full transition-all"
                      style={{
                        width: `${percentage}%`,
                        background: percentage === 100
                          ? 'hsl(var(--secondary))'
                          : percentage >= 50
                          ? 'hsl(var(--primary))'
                          : 'hsl(var(--accent))'
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card className="border-primary/20 shadow-xl">
        <CardHeader className="bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50">
          <CardTitle className="flex items-center gap-2">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full blur-sm opacity-40"></div>
              <div className="relative p-2 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-full">
                <Icon name="GraduationCap" className="text-white" size={24} />
              </div>
            </div>
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Прогресс по предметам ЕГЭ
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-6">
            {subjects.length === 0 ? (
              <div className="text-center py-8">
                <Icon name="BookOpen" size={48} className="mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Добавьте предметы на вкладке ЕГЭ</p>
              </div>
            ) : (
              subjects.map((subject) => (
                <div key={subject.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 ${subject.color} rounded-lg`} />
                      <span className="font-semibold">{subject.name}</span>
                    </div>
                    <span className="text-lg font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                      {subjectsProgress[subject.id] || 0}%
                    </span>
                  </div>
                  <Progress value={subjectsProgress[subject.id] || 0} className="h-2" />
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="border-primary/20 shadow-xl">
        <CardHeader className="bg-gradient-to-r from-secondary/5 to-secondary/10">
          <CardTitle className="flex items-center gap-2">
            <Icon name="Calendar" className="text-secondary" size={28} />
            Календарь активности
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: 35 }, (_, i) => {
              const intensity = 0;
              return (
                <div
                  key={i}
                  className="aspect-square rounded-md transition-transform hover:scale-110 cursor-pointer"
                  style={{
                    backgroundColor: 'hsl(var(--muted))'
                  }}
                  title={`День ${i + 1}`}
                />
              );
            })}
          </div>
          <p className="text-xs text-muted-foreground mt-4 text-center">
            Последние 5 недель активности
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Statistics;