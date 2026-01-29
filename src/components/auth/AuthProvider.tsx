'use client';

import { SessionProvider } from 'next-auth/react';
import { ReactNode, useEffect, useState } from 'react';
import { isDemoMode } from '@/lib/demo/demoState';

interface AuthProviderProps {
  children: ReactNode;
}

const demoSession = {
  user: {
    name: 'Demo User',
    email: 'demo@example.com',
    image: null,
    id: 'demo',
    householdId: 'demo',
  },
  expires: '2099-12-31T23:59:59.999Z',
};

export default function AuthProvider({ children }: AuthProviderProps) {
  const [demo, setDemo] = useState(false);

  useEffect(() => {
    setDemo(isDemoMode());
  }, []);

  if (demo) {
    return (
      <SessionProvider session={demoSession as never}>
        {children}
      </SessionProvider>
    );
  }

  return <SessionProvider>{children}</SessionProvider>;
}
