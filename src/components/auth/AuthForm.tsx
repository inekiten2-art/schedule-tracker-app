import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import { useAuth } from '@/contexts/AuthContext';

const AuthForm = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login, register } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (isLogin) {
        await login(email, password);
      } else {
        if (!name.trim()) {
          setError('Введите ваше имя');
          setIsLoading(false);
          return;
        }
        await register(email, password, name);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 opacity-20 animate-float">
          <Icon name="BookOpen" size={80} className="text-blue-500" />
        </div>
        <div className="absolute top-32 right-20 opacity-15 animate-float-delayed">
          <Icon name="FlaskConical" size={60} className="text-purple-500" />
        </div>
        <div className="absolute bottom-32 left-16 opacity-20 animate-float">
          <Icon name="Atom" size={70} className="text-pink-500" />
        </div>
        <div className="absolute top-1/4 right-1/4 opacity-10 animate-float-delayed">
          <Icon name="Calculator" size={90} className="text-indigo-500" />
        </div>
        <div className="absolute bottom-20 right-10 opacity-15 animate-float">
          <Icon name="Microscope" size={75} className="text-teal-500" />
        </div>
        
        <svg className="absolute top-1/3 left-1/4 opacity-10 animate-pulse" width="120" height="120" viewBox="0 0 120 120">
          <path d="M10,60 Q30,10 60,30 T110,60" stroke="#6366f1" strokeWidth="2" fill="none" />
          <path d="M10,70 Q30,120 60,100 T110,70" stroke="#8b5cf6" strokeWidth="2" fill="none" />
        </svg>
        
        <svg className="absolute bottom-1/4 right-1/3 opacity-10 animate-pulse" width="100" height="100" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="40" stroke="#ec4899" strokeWidth="2" fill="none" />
          <circle cx="50" cy="50" r="25" stroke="#f97316" strokeWidth="2" fill="none" />
          <line x1="50" y1="10" x2="50" y2="90" stroke="#10b981" strokeWidth="1" />
          <line x1="10" y1="50" x2="90" y2="50" stroke="#10b981" strokeWidth="1" />
        </svg>

        <div className="absolute top-1/2 left-10 opacity-20 text-4xl font-serif text-purple-600 animate-float-delayed">
          π
        </div>
        <div className="absolute top-20 right-1/3 opacity-15 text-5xl font-serif text-blue-600 animate-float">
          ∫
        </div>
        <div className="absolute bottom-40 left-1/3 opacity-20 text-3xl font-serif text-pink-600 animate-pulse">
          E=mc²
        </div>
      </div>

      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <Card className="w-full max-w-md shadow-2xl backdrop-blur-sm bg-white/95 border-2 border-primary/10">
          <CardHeader className="space-y-1 text-center pb-8">
            <div className="flex justify-center mb-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full blur-lg opacity-50 animate-pulse"></div>
                <div className="relative p-4 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-full">
                  <Icon name="Sparkles" size={48} className="text-white" />
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Успешный Успех
              </h1>
              <CardTitle className="text-xl font-semibold text-foreground">
                {isLogin ? 'Вход в аккаунт' : 'Регистрация'}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {isLogin ? 'Продолжай путь к мечте' : 'Начни свой путь к успеху'}
              </p>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div>
                  <Label htmlFor="name">Имя</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Ваше имя"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required={!isLogin}
                    className="border-primary/20 focus:border-primary"
                  />
                </div>
              )}
              
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="border-primary/20 focus:border-primary"
                />
              </div>
              
              <div>
                <Label htmlFor="password">Пароль</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="border-primary/20 focus:border-primary"
                />
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Icon name="Loader2" size={16} className="mr-2 animate-spin" />
                    Загрузка...
                  </>
                ) : (
                  <>
                    <Icon name={isLogin ? 'LogIn' : 'UserPlus'} size={16} className="mr-2" />
                    {isLogin ? 'Войти' : 'Зарегистрироваться'}
                  </>
                )}
              </Button>
            </form>

            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError('');
                }}
                className="text-sm text-primary hover:underline font-medium"
              >
                {isLogin ? 'Нет аккаунта? Зарегистрируйтесь' : 'Уже есть аккаунт? Войдите'}
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AuthForm;
