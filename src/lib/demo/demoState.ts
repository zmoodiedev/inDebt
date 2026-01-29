const DEMO_KEY = 'finance_dashboard_demo';

export function isDemoMode(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return document.cookie.split('; ').some(c => c === `${DEMO_KEY}=true`);
  } catch {
    return false;
  }
}

export function setDemoMode(active: boolean): void {
  if (typeof window === 'undefined') return;
  try {
    if (active) {
      document.cookie = `${DEMO_KEY}=true; path=/; SameSite=Lax`;
    } else {
      document.cookie = `${DEMO_KEY}=; path=/; max-age=0`;
    }
  } catch {
    // cookies unavailable
  }
}
