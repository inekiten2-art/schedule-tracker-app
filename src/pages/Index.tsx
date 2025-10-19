import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import WeeklySchedule from '@/components/WeeklySchedule';
import EGETrackerWithAuth from '@/components/EGETrackerWithAuth';
import Statistics from '@/components/Statistics';
import AuthForm from '@/components/auth/AuthForm';
import { useAuth } from '@/contexts/AuthContext';

const Index = () => {
  const [activeTab, setActiveTab] = useState('schedule');
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Icon name="Loader2" className="animate-spin" size={48} />
      </div>
    );
  }

  if (!user) {
    return <AuthForm />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
      <div className="container max-w-7xl mx-auto px-4 py-8">
        <header className="mb-8 text-center animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-2 flex items-center justify-center gap-3">
            <Icon name="Target" className="text-primary" size={42} />
            ПродуктивМастер
          </h1>
          <p className="text-muted-foreground text-lg">
            Твой путь к успеху на ЕГЭ и продуктивной жизни
          </p>
        </header>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <Card className="mb-6 p-2 shadow-lg animate-scale-in">
            <TabsList className="grid w-full grid-cols-3 gap-2">
              <TabsTrigger value="schedule" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Icon name="Calendar" size={18} />
                <span className="hidden sm:inline">Расписание</span>
              </TabsTrigger>
              <TabsTrigger value="ege" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Icon name="GraduationCap" size={18} />
                <span className="hidden sm:inline">ЕГЭ</span>
              </TabsTrigger>
              <TabsTrigger value="stats" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Icon name="TrendingUp" size={18} />
                <span className="hidden sm:inline">Статистика</span>
              </TabsTrigger>
            </TabsList>
          </Card>

          <TabsContent value="schedule" className="animate-fade-in">
            <WeeklySchedule />
          </TabsContent>

          <TabsContent value="ege" className="animate-fade-in">
            <EGETrackerWithAuth />
          </TabsContent>

          <TabsContent value="stats" className="animate-fade-in">
            <Statistics />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;