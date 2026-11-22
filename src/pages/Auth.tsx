import { useState } from 'react';
import { Link, useSearch, useNavigate } from '@tanstack/react-router';
import { Mail, Lock, Eye, EyeOff, Chrome } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/features/auth/useAuth';
import { useToast } from '@/components/ui/Toaster';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';

const loginSchema = z.object({
  email: z.string().email('Nieprawidłowy adres e-mail'),
  password: z.string().min(6, 'Hasło musi mieć co najmniej 6 znaków')
});

const registerSchema = loginSchema.extend({
  displayName: z.string().min(2, 'Nazwa musi mieć co najmniej 2 znaki').optional(),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Hasła nie są identyczne',
  path: ['confirmPassword']
});

const magicLinkSchema = z.object({
  email: z.string().email('Nieprawidłowy adres e-mail')
});

type LoginForm = z.infer<typeof loginSchema>;
type RegisterForm = z.infer<typeof registerSchema>;
type MagicLinkForm = z.infer<typeof magicLinkSchema>;

export function AuthPage() {
  const navigate = useNavigate();
  const search = useSearch({ strict: false }) as { verified?: boolean; oauth?: boolean; reset?: boolean; magic?: boolean };
  const { signIn, signUp, signInWithOAuth, signInWithMagicLink } = useAuth();
  const { toast } = useToast();

  const [mode, setMode] = useState<'login' | 'register' | 'magic'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Handle URL params
  if (search.verified) {
    toast({ type: 'success', title: 'E-mail zweryfikowany', message: 'Możesz się teraz zalogować' });
    navigate({ to: '/auth', search: () => ({}) as any });
  }
  if (search.oauth) {
    toast({ type: 'info', title: 'Logowanie przez Google', message: 'Przekierowywanie...' });
  }
  if (search.reset) {
    setMode('login');
    toast({ type: 'info', title: 'Reset hasła', message: 'Ustaw nowe hasło poniżej' });
    navigate({ to: '/auth', search: () => ({}) as any });
  }
  if (search.magic) {
    toast({ type: 'success', title: 'Link magiczny', message: 'Zostałeś zalogowany!' });
    navigate({ to: '/auth', search: () => ({}) as any });
  }

  // Login form
  const loginForm = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' }
  });

  // Register form
  const registerForm = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: { email: '', password: '', confirmPassword: '', displayName: '' }
  });

  // Magic link form
  const magicForm = useForm<MagicLinkForm>({
    resolver: zodResolver(magicLinkSchema),
    defaultValues: { email: '' }
  });

  const handleLogin = async (data: LoginForm) => {
    setIsLoading(true);
    const { error } = await signIn(data.email, data.password);
    setIsLoading(false);

    if (error) {
      toast({ type: 'error', title: 'Błąd logowania', message: error.message });
    } else {
      toast({ type: 'success', title: 'Zalogowano!', message: 'Przekierowywanie...' });
      navigate({ to: '/' });
    }
  };

  const handleRegister = async (data: RegisterForm) => {
    setIsLoading(true);
    const { error } = await signUp(data.email, data.password, data.displayName);
    setIsLoading(false);

    if (error) {
      toast({ type: 'error', title: 'Błąd rejestracji', message: error.message });
    } else {
      toast({ type: 'success', title: 'Rejestracja udana!', message: 'Sprawdź e-mail w celu weryfikacji konta' });
      setMode('login');
      registerForm.reset();
    }
  };

  const handleMagicLink = async (data: MagicLinkForm) => {
    setIsLoading(true);
    const { error } = await signInWithMagicLink(data.email);
    setIsLoading(false);

    if (error) {
      toast({ type: 'error', title: 'Błąd', message: error.message });
    } else {
      toast({ type: 'success', title: 'Link wysłany!', message: 'Sprawdź skrzynkę e-mail i kliknij link logowania' });
    }
  };

  const handleGoogleAuth = async () => {
    setIsLoading(true);
    const { error } = await signInWithOAuth('google');
    setIsLoading(false);
    if (error) {
      toast({ type: 'error', title: 'Błąd Google OAuth', message: error.message });
    }
  };

  const switchMode = (newMode: 'login' | 'register' | 'magic') => {
    setMode(newMode);
    loginForm.reset();
    registerForm.reset();
    magicForm.reset();
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 font-serif font-bold text-3xl text-ink mb-4">
            <span className="text-gold">▶</span> Bez Maski
          </Link>
          <h1 className="text-2xl font-serif font-bold text-ink">
            {mode === 'login' ? 'Zaloguj się' : mode === 'register' ? 'Zarejestruj się' : 'Logowanie linkiem'}
          </h1>
          <p className="mt-2 text-muted">
            {mode === 'login' ? 'Nie masz konta?' : mode === 'register' ? 'Masz już konto?' : 'Preferujesz hasło?'}
            <button
              onClick={() => switchMode(mode === 'login' ? 'register' : mode === 'register' ? 'login' : 'login')}
              className="ml-2 text-gold hover:text-gold-light font-medium"
            >
              {mode === 'login' ? 'Zarejestruj się' : mode === 'register' ? 'Zaloguj się' : 'Użyj hasła'}
            </button>
          </p>
        </div>

        {/* Magic Link option */}
        {mode !== 'magic' && (
          <button
            onClick={() => switchMode('magic')}
            className="w-full mb-6 p-3 rounded-lg bg-panel-hover border border-line text-sm text-muted hover:border-gold/50 hover:text-ink transition-colors"
          >
            <Mail className="w-4 h-4 inline mr-2" /> Zaloguj linkiem magicznym (bez hasła)
          </button>
        )

        {/* Forms */}
        <Card className="animate-fade-in">
          {mode === 'login' && (
            <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
              <Input
                label="E-mail"
                type="email"
                placeholder="jan@kowalski.pl"
                leftIcon={<Mail className="w-5 h-5" />}
                error={loginForm.formState.errors.email?.message}
                {...loginForm.register('email')}
                autoComplete="email"
              />
              <div className="relative">
                <Input
                  label="Hasło"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  leftIcon={<Lock className="w-5 h-5" />}
                  rightIcon={
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-muted hover:text-ink"
                      aria-label={showPassword ? 'Ukryj hasło' : 'Pokaż hasło'}
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  }
                  error={loginForm.formState.errors.password?.message}
                  {...loginForm.register('password')}
                  autoComplete="current-password"
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm text-muted cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 rounded border-line bg-panel text-gold focus:ring-gold" />
                  Zapamiętaj mnie
                </label>
                <a href="/auth?reset=true" className="text-sm text-gold hover:text-gold-light">
                  Zapomniałeś hasła?
                </a>
              </div>

              <Button type="submit" className="w-full" size="lg" loading={isLoading}>
                Zaloguj się
              </Button>
            </form>
          )}

          {mode === 'register' && (
            <form onSubmit={registerForm.handleSubmit(handleRegister)} className="space-y-4">
              <Input
                label="Nazwa wyświetlana (opcjonalnie)"
                placeholder="Jan Kowalski"
                leftIcon={<Mail className="w-5 h-5" />}
                error={registerForm.formState.errors.displayName?.message}
                {...registerForm.register('displayName')}
              />
              <Input
                label="E-mail"
                type="email"
                placeholder="jan@kowalski.pl"
                leftIcon={<Mail className="w-5 h-5" />}
                error={registerForm.formState.errors.email?.message}
                {...registerForm.register('email')}
                autoComplete="email"
              />
              <div className="relative">
                <Input
                  label="Hasło"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  leftIcon={<Lock className="w-5 h-5" />}
                  rightIcon={
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-muted hover:text-ink"
                      aria-label={showPassword ? 'Ukryj hasło' : 'Pokaż hasło'}
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  }
                  error={registerForm.formState.errors.password?.message}
                  {...registerForm.register('password')}
                  autoComplete="new-password"
                />
              </div>
              <div className="relative">
                <Input
                  label="Powtórz hasło"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  leftIcon={<Lock className="w-5 h-5" />}
                  error={registerForm.formState.errors.confirmPassword?.message}
                  {...registerForm.register('confirmPassword')}
                  autoComplete="new-password"
                />
              </div>

              <p className="text-xs text-muted text-center">
                Rejestrując się, akceptujesz <a href="/regulamin" className="text-gold hover:underline">Regulamin</a> i <a href="/polityka-prywatnosci" className="text-gold hover:underline">Politykę prywatności</a>.
              </p>

              <Button type="submit" className="w-full" size="lg" loading={isLoading}>
                Zarejestruj się
              </Button>
            </form>
          )}

          {mode === 'magic' && (
            <form onSubmit={magicForm.handleSubmit(handleMagicLink)} className="space-y-4">
              <p className="text-sm text-muted text-center">
                Wpisz swój e-mail, a wyślemy Ci link do logowania bez hasła.
              </p>
              <Input
                label="E-mail"
                type="email"
                placeholder="jan@kowalski.pl"
                leftIcon={<Mail className="w-5 h-5" />}
                error={magicForm.formState.errors.email?.message}
                {...magicForm.register('email')}
                autoComplete="email"
              />
              <Button type="submit" className="w-full" size="lg" loading={isLoading}>
                Wyślij link logowania
              </Button>
            </form>
          )}
        </Card>

        {/* Divider */}
        <div className="my-6 relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-line" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-bg text-muted">lub</span>
          </div>
        </div>

        {/* Google OAuth */}
        <Button
          variant="secondary"
          className="w-full"
          size="lg"
          leftIcon={<Chrome className="w-5 h-5" />}
          onClick={handleGoogleAuth}
          loading={isLoading}
        >
          Kontynuuj z Google
        </Button>

        {/* Info */}
        <p className="mt-6 text-center text-xs text-muted">
          Logowanie przez Google nie daje dostępu do Twoich danych YouTube.
          Używamy tylko podstawowych informacji profilowych.
        </p>
      </div>
    </div>
  );
}