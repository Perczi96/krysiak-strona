import { ReactNode, useEffect, useState } from 'react';
import { AuthProvider, useAuth } from '@/features/auth/useAuth';
import { isPushSupported, requestNotificationPermission, subscribeToPush } from '@/lib/push';
import { useToast } from '@/components/ui/Toaster';

function PushNotificationsManager() {
  const { profile, isLoading } = useAuth();
  const { toast } = useToast();
  const [prompted, setPrompted] = useState(false);

  useEffect(() => {
    if (isLoading || !profile) return;

    // Tylko dla zalogowanych użytkowników z włączonymi powiadomieniami
    if (profile.push_notifications && isPushSupported()) {
      // Sprawdź czy mamy już subskrypcję
      if (!profile.push_subscription) {
        // Opóźnij prompt o chwilę po zalogowaniu
        const timer = setTimeout(async () => {
          if (prompted) return;
          const permission = await requestNotificationPermission();
          if (permission === 'granted') {
            await subscribeToPush();
            toast({ type: 'success', title: 'Powiadomienia włączone', message: 'Otrzymasz powiadomienia o nowych materiałach i live\'ach' });
          }
          setPrompted(true);
        }, 5000);

        return () => clearTimeout(timer);
      }
    }
  }, [profile, isLoading, prompted, toast]);

  return null;
}

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      {children}
      <PushNotificationsManager />
    </AuthProvider>
  );
}