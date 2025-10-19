import { useState, useEffect } from 'react';
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
  time?: string;
  repeat: boolean;
  completed: boolean;
  timerMinutes: number | null;
  timeSpent: number;
  streak: number;
  missed: number;
  notifyEnabled: boolean;
  notifyMinutes: number;
}

const DAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

const getDayWithDate = (dayIndex: number) => {
  const today = new Date();
  const currentDay = today.getDay();
  const mondayOffset = currentDay === 0 ? -6 : 1 - currentDay;
  
  const targetDate = new Date(today);
  targetDate.setDate(today.getDate() + mondayOffset + dayIndex);
  
  const day = targetDate.getDate();
  const month = targetDate.getMonth() + 1;
  
  return `${day}.${month.toString().padStart(2, '0')}`;
};

const WeeklySchedule = () => {
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: '1',
      title: 'Полить цветы',
      day: 'Пн',
      time: '10:00',
      repeat: true,
      completed: false,
      timerMinutes: 10,
      timeSpent: 0,
      streak: 3,
      missed: 0,
      notifyEnabled: true,
      notifyMinutes: 15
    },
    {
      id: '2',
      title: 'Математика ЕГЭ',
      day: 'Вт',
      time: '14:00',
      repeat: true,
      completed: false,
      timerMinutes: 60,
      timeSpent: 0,
      streak: 12,
      missed: 1,
      notifyEnabled: true,
      notifyMinutes: 30
    }
  ]);

  const [newTask, setNewTask] = useState({ 
    title: '', 
    day: 'Пн', 
    time: '12:00',
    timerMinutes: 30, 
    repeat: false, 
    hasTimer: true,
    notifyEnabled: false,
    notifyMinutes: 15
  });

  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
  }, []);

  const requestNotificationPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
    }
  };

  useEffect(() => {
    const checkNotifications = () => {
      const now = new Date();
      const currentDay = DAYS[now.getDay() === 0 ? 6 : now.getDay() - 1];
      
      tasks.forEach(task => {
        if (!task.notifyEnabled || !task.time || task.completed) return;
        
        if (task.day === currentDay) {
          const [hours, minutes] = task.time.split(':').map(Number);
          const taskTime = new Date();
          taskTime.setHours(hours, minutes, 0, 0);
          
          const notifyTime = new Date(taskTime.getTime() - task.notifyMinutes * 60000);
          
          const diff = notifyTime.getTime() - now.getTime();
          
          if (diff > 0 && diff < 60000 && Notification.permission === 'granted') {
            new Notification('ПродуктивМастер', {
              body: `Через ${task.notifyMinutes} мин: ${task.title}`,
              icon: '/favicon.ico'
            });
          }
        }
      });
    };

    const interval = setInterval(checkNotifications, 60000);
    checkNotifications();

    return () => clearInterval(interval);
  }, [tasks]);

  const addTask = () => {
    if (!newTask.title.trim()) return;
    
    const task: Task = {
      id: Date.now().toString(),
      title: newTask.title,
      day: newTask.day,
      time: newTask.time,
      repeat: newTask.repeat,
      completed: false,
      timerMinutes: newTask.hasTimer ? newTask.timerMinutes : null,
      timeSpent: 0,
      streak: 0,
      missed: 0,
      notifyEnabled: newTask.notifyEnabled,
      notifyMinutes: newTask.notifyMinutes
    };
    
    setTasks([...tasks, task]);
    setNewTask({ 
      title: '', 
      day: 'Пн', 
      time: '12:00',
      timerMinutes: 30, 
      repeat: false, 
      hasTimer: true,
      notifyEnabled: false,
      notifyMinutes: 15
    });
  };

  const toggleComplete = (id: string) => {
    setTasks(tasks.map(task => {
      if (task.id === id) {
        const isCompleting = !task.completed;
        return {
          ...task,
          completed: isCompleting,
          streak: isCompleting ? task.streak + 1 : task.streak,
          timeSpent: isCompleting && task.timerMinutes !== null ? task.timerMinutes : task.timeSpent
        };
      }
      return task;
    }));
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  const getTasksByDay = (day: string) => {
    return tasks.filter(task => task.day === day).sort((a, b) => {
      if (!a.time || !b.time) return 0;
      return a.time.localeCompare(b.time);
    });
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
            <DialogContent className="max-h-[90vh] overflow-y-auto">
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
                <div className="grid grid-cols-2 gap-3">
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
                    <Label>Время</Label>
                    <Input
                      type="time"
                      value={newTask.time}
                      onChange={(e) => setNewTask({ ...newTask, time: e.target.value })}
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={newTask.hasTimer}
                    onCheckedChange={(checked) => setNewTask({ ...newTask, hasTimer: checked as boolean })}
                  />
                  <Label>Задача с таймером</Label>
                </div>
                {newTask.hasTimer && (
                  <div>
                    <Label>Время выполнения (мин)</Label>
                    <Input
                      type="number"
                      value={newTask.timerMinutes}
                      onChange={(e) => setNewTask({ ...newTask, timerMinutes: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={newTask.repeat}
                    onCheckedChange={(checked) => setNewTask({ ...newTask, repeat: checked as boolean })}
                  />
                  <Label>Повторять каждую неделю</Label>
                </div>

                <div className="border-t pt-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Checkbox
                      checked={newTask.notifyEnabled}
                      onCheckedChange={(checked) => {
                        setNewTask({ ...newTask, notifyEnabled: checked as boolean });
                        if (checked) requestNotificationPermission();
                      }}
                    />
                    <Label>Включить уведомления</Label>
                  </div>
                  
                  {newTask.notifyEnabled && (
                    <div>
                      <Label>Предупредить за:</Label>
                      <select
                        className="w-full p-2 border rounded-md mt-1"
                        value={newTask.notifyMinutes}
                        onChange={(e) => setNewTask({ ...newTask, notifyMinutes: parseInt(e.target.value) })}
                      >
                        <option value={10}>10 минут</option>
                        <option value={15}>15 минут</option>
                        <option value={30}>30 минут</option>
                        <option value={45}>45 минут</option>
                        <option value={60}>1 час</option>
                      </select>
                    </div>
                  )}
                  
                  {notificationPermission !== 'granted' && newTask.notifyEnabled && (
                    <p className="text-xs text-amber-600 mt-2">
                      Разреши уведомления в браузере для работы напоминаний
                    </p>
                  )}
                </div>

                <Button onClick={addTask} className="w-full">
                  Создать задачу
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {DAYS.map((day, index) => (
              <Card key={day} className="border-2 hover:border-primary/30 transition-colors">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-semibold flex flex-col gap-1">
                    <div className="flex items-center justify-between">
                      <span>{day}</span>
                      <Badge variant="outline" className="text-xs">
                        {getTasksByDay(day).length}
                      </Badge>
                    </div>
                    <span className="text-sm font-normal text-muted-foreground">{getDayWithDate(index)}</span>
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
                                {task.time && (
                                  <p className="text-xs text-muted-foreground mt-0.5">
                                    {task.time}
                                  </p>
                                )}
                                <div className="flex items-center gap-1 mt-1">
                                  {task.repeat && (
                                    <Badge variant="secondary" className="text-xs">
                                      <Icon name="Repeat" size={10} className="mr-1" />
                                      Повтор
                                    </Badge>
                                  )}
                                  {task.notifyEnabled && (
                                    <Badge variant="outline" className="text-xs">
                                      <Icon name="Bell" size={10} className="mr-1" />
                                      {task.notifyMinutes}м
                                    </Badge>
                                  )}
                                </div>
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
                            {task.timerMinutes !== null && (
                              <div className="flex items-center gap-1">
                                <Icon name="Timer" size={14} className="text-accent" />
                                <span>{task.timerMinutes}м</span>
                              </div>
                            )}
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
