import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import Icon from '@/components/ui/icon';

const Statistics = () => {
  const weeklyData = [
    { day: 'Пн', completed: 4, total: 5 },
    { day: 'Вт', completed: 5, total: 5 },
    { day: 'Ср', completed: 3, total: 6 },
    { day: 'Чт', completed: 6, total: 6 },
    { day: 'Пт', completed: 4, total: 5 },
    { day: 'Сб', completed: 2, total: 3 },
    { day: 'Вс', completed: 1, total: 2 }
  ];

  const egeProgress = [
    { subject: 'Математика', progress: 65, color: 'bg-blue-500' },
    { subject: 'Русский язык', progress: 0, color: 'bg-purple-500' },
    { subject: 'Физика', progress: 0, color: 'bg-green-500' },
    { subject: 'Информатика', progress: 0, color: 'bg-orange-500' }
  ];

  const totalCompleted = weeklyData.reduce((sum, day) => sum + day.completed, 0);
  const totalTasks = weeklyData.reduce((sum, day) => sum + day.total, 0);
  const completionRate = Math.round((totalCompleted / totalTasks) * 100);

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
                <p className="text-2xl font-bold">12 дней</p>
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
              const percentage = (day.completed / day.total) * 100;
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
        <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10">
          <CardTitle className="flex items-center gap-2">
            <Icon name="GraduationCap" className="text-primary" size={28} />
            Прогресс по предметам ЕГЭ
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-6">
            {egeProgress.map((item, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 ${item.color} rounded-lg`} />
                    <span className="font-semibold">{item.subject}</span>
                  </div>
                  <span className="text-lg font-bold text-primary">{item.progress}%</span>
                </div>
                <Progress value={item.progress} className="h-2" />
              </div>
            ))}
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
              const intensity = Math.random();
              return (
                <div
                  key={i}
                  className="aspect-square rounded-md transition-transform hover:scale-110 cursor-pointer"
                  style={{
                    backgroundColor:
                      intensity > 0.7
                        ? 'hsl(var(--secondary))'
                        : intensity > 0.4
                        ? 'hsl(var(--primary) / 0.5)'
                        : intensity > 0.2
                        ? 'hsl(var(--muted))'
                        : 'hsl(var(--border))'
                  }}
                  title={`День ${i + 1}`}
                />
              );
            })}
          </div>
          <div className="flex items-center justify-between mt-4 text-xs text-muted-foreground">
            <span>Меньше</span>
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 rounded-sm bg-border" />
              <div className="w-4 h-4 rounded-sm bg-muted" />
              <div className="w-4 h-4 rounded-sm bg-primary/50" />
              <div className="w-4 h-4 rounded-sm bg-secondary" />
            </div>
            <span>Больше</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Statistics;
