// ========================================================
// Client-side Web Push & Device Notification Helper
// ========================================================

export async function isPushNotificationSupported(): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
}

export async function getNotificationPermissionState(): Promise<NotificationPermission> {
  if (typeof window === 'undefined' || !('Notification' in window)) return 'default';
  return Notification.permission;
}

export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!('serviceWorker' in navigator)) return null;
  try {
    const reg = await navigator.serviceWorker.register('/sw.js');
    await navigator.serviceWorker.ready;
    return reg;
  } catch (err) {
    console.error('Service worker registration failed:', err);
    return null;
  }
}

export async function subscribeToDeviceNotifications(): Promise<{
  success: boolean;
  subscription?: any;
  error?: string;
}> {
  if (!(await isPushNotificationSupported())) {
    return { success: false, error: 'Push notifications are not supported by this browser.' };
  }

  const permission = await Notification.requestPermission();
  if (permission !== 'granted') {
    return {
      success: false,
      error: 'Notification permission was denied. Please allow notifications in your browser settings.',
    };
  }

  const reg = await registerServiceWorker();
  if (!reg) {
    return { success: false, error: 'Failed to initialize service worker.' };
  }

  try {
    // Generate or get existing subscription
    let sub = await reg.pushManager.getSubscription();
    if (!sub) {
      // In production, VAPID key is passed. For fallback, standard subscribe
      const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      const options: PushSubscriptionOptionsInit = {
        userVisibleOnly: true,
        ...(vapidKey ? { applicationServerKey: vapidKey } : {}),
      };
      sub = await reg.pushManager.subscribe(options);
    }

    const subJson = sub.toJSON();

    // Send subscription to server
    const res = await fetch('/api/notifications/push/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        endpoint: sub.endpoint,
        p256dh: subJson.keys?.p256dh || '',
        auth: subJson.keys?.auth || '',
        userAgent: navigator.userAgent,
      }),
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Failed to save subscription on server');
    }

    return { success: true, subscription: subJson };
  } catch (err: any) {
    return { success: false, error: err.message || 'Error subscribing to device notifications' };
  }
}

/**
 * Sends an immediate local test notification on device
 */
export async function triggerLocalTestNotification(): Promise<boolean> {
  const reg = await registerServiceWorker();
  if (!reg) return false;

  if (Notification.permission === 'granted') {
    await reg.showNotification('⏰ PurchaseGuard Return Reminder', {
      body: 'Action Required: Only 3 days left to return Sony WH-1000XM5! Tap to prepare return.',
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      vibrate: [200, 100, 200],
      data: {
        url: '/en/dashboard',
      },
    });
    return true;
  }
  return false;
}
