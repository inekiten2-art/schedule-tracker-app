import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

interface Task {
  id: string;
  title: string;
  day: string;
  repeat: boolean;
  completed: boolean;
  timerMinutes: number;
  timeSpent: number;
  streak: number;
  missed: number;
}

const DAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

const WeeklySchedule = () => {
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: '1',
      title: 'Полить цветы',
      day: 'Пн',
      repeat: true,
      completed: false,
      timerMinutes: 10,
      timeSpent: 0,
      streak: 3,
      missed: 0
    },
    {
      id: '2',
      title: 'Математика ЕГЭ',
      day: 'Вт',
      repeat: true,
      completed: false,
      timerMinutes: 60,
      timeSpent: 0,
      streak: 12,
      missed: 1
    }
  ]);

  const [newTask, setNewTask] = useState({ title: '', day: 'Пн', timerMinutes: 30, repeat: false });
  const [activeTimer, setActiveTimer] = useState<string | null>(null);

  const addTask = () => {
    if (!newTask.title.trim()) return;
    
    const task: Task = {
      id: Date.now().toString(),
      title: newTask.title,
      day: newTask.day,
      repeat: newTask.repeat,
      completed: false,
      timerMinutes: newTask.timerMinutes,
      timeSpent: 0,
      streak: 0,
      missed: 0
    };
    
    setTasks([...tasks, task]);
    setNewTask({ title: '', day: 'Пн', timerMinutes: 30, repeat: false });
  };

  const toggleComplete = (id: string) => {
    setTasks(tasks.map(task => {
      if (task.id === id) {
        const isCompleting = !task.completed;
        return {
          ...task,
          completed: isCompleting,
          streak: isCompleting ? task.streak + 1 : task.streak,
          timeSpent: isCompleting ? task.timerMinutes : task.timeSpent
        };
      }
      return task;
    }));
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  const getTasksByDay = (day: string) => {
    return tasks.filter(task => task.day === day);
  };

  return (
    <div className="space-y-6">
      <Card className="border-primary/20 shadow-xl">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10">
          <CardTitle className="flex items-center gap-2">
            <Icon name="CalendarDays" className="text-primary" size={28} />
            Еженедельное расписание
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <Dialog>
            <DialogTrigger asChild>
              <Button className="w-full mb-6 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all">
                <Icon name="Plus" size={20} className="mr-2" />
                Добавить задачу
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Новая задача</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div>
                  <Label>Название</Label>
                  <Input
                    placeholder="Что нужно сделать?"
                    value={newTask.title}
                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  />
                </div>
                <div>
                  <Label>День недели</Label>
                  <select
                    className="w-full p-2 border rounded-md"
                    value={newTask.day}
                    onChange={(e) => setNewTask({ ...newTask, day: e.target.value })}
                  >
                    {DAYS.map(day => (
                      <option key={day} value={day}>{day}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label>Время выполнения (мин)</Label>
                  <Input
                    type="number"
                    value={newTask.timerMinutes}
                    onChange={(e) => setNewTask({ ...newTask, timerMinutes: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={newTask.repeat}
                    onCheckedChange={(checked) => setNewTask({ ...newTask, repeat: checked as boolean })}
                  />
                  <Label>Повторять каждую неделю</Label>
                </div>
                <Button onClick={addTask} className="w-full">
                  Создать задачу
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {DAYS.map(day => (
              <Card key={day} className="border-2 hover:border-primary/30 transition-colors">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-semibold flex items-center justify-between">
                    <span>{day}</span>
                    <Badge variant="outline" className="text-xs">
                      {getTasksByDay(day).length}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {getTasksByDay(day).length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">Нет задач</p>
                  ) : (
                    getTasksByDay(day).map(task => (
                      <Card
                        key={task.id}
                        className={`p-3 transition-all ${
                          task.completed
                            ? 'bg-secondary/10 border-secondary'
                            : 'hover:shadow-md'
                        }`}
                      >
                        <div className="space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-start gap-2 flex-1">
                              <Checkbox
                                checked={task.completed}
                                onCheckedChange={() => toggleComplete(task.id)}
                                className="mt-1"
                              />
                              <div className="flex-1">
                                <p className={`text-sm font-medium ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                                  {task.title}
                                </p>
                                {task.repeat && (
                                  <Badge variant="secondary" className="text-xs mt-1">
                                    <Icon name="Repeat" size={12} className="mr-1" />
                                    Повтор
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-destructive hover:text-destructive hover:bg-destructive/10"
                              onClick={() => deleteTask(task.id)}
                            >
                              <Icon name="Trash2" size={14} />
                            </Button>
                          </div>

                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Icon name="Timer" size={14} className="text-accent" />
                              <span>{task.timerMinutes}м</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Icon name="Flame" size={14} className="text-secondary" />
                              <span>{task.streak}</span>
                            </div>
                            {task.missed > 0 && (
                              <div className="flex items-center gap-1">
                                <Icon name="XCircle" size={14} className="text-destructive" />
                                <span>{task.missed}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </Card>
                    ))
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WeeklySchedule;
