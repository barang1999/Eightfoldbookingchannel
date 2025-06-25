import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { getOrCreateSession } from '../utils/useSession';
import { io } from 'socket.io-client';

const socket = io(import.meta.env.VITE_API_BASE_URL, {
  transports: ['websocket'],
});

export const usePageTracking = () => {
  const location = useLocation();

  useEffect(() => {
    const startTime = Date.now();

    const trackVisit = async (engagementTime = 0) => {
      try {
        const { sessionId } = getOrCreateSession();

        const propertyId = localStorage.getItem('propertyId') || null;

        console.log('📊 Sending visit data:', { path: location.pathname, sessionId, propertyId, engagementTime });

        await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/analytics/track`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            path: location.pathname,
            referrer: document.referrer,
            sessionId,
            propertyId,
            engagementTime,
          }),
        });

        socket.emit('user_connected', {
          sessionId,
          propertyId,
          path: location.pathname,
        });
      } catch (err) {
        console.error('❌ Tracking failed:', err);
      }
    };

    console.log('📊 Initial page load tracking');
    trackVisit();

    const handleUnload = () => {
      console.log("📤 [Unload] Triggered handleUnload");
      console.log("🌍 API URL:", import.meta.env.VITE_API_BASE_URL);
      const duration = Math.floor((Date.now() - startTime) / 1000);
      const { sessionId, propertyId } = getOrCreateSession();

      if (sessionId && propertyId) {
        if (navigator.sendBeacon) {
          const formData = new FormData();
          formData.append('sessionId', sessionId);
          formData.append('propertyId', propertyId);
          formData.append('path', location.pathname);
          formData.append('engagementTime', duration.toString());

          const beaconUrl = `${import.meta.env.VITE_API_BASE_URL}/api/analytics/update-engagement`;
          const success = navigator.sendBeacon(beaconUrl, formData);
          console.log('📡 Beacon sent (FormData)?', success);

          socket.emit('user_disconnected', {
            sessionId,
            propertyId,
            path: location.pathname,
          });
        } else {
          fetch(`${import.meta.env.VITE_API_BASE_URL}/api/analytics/update-engagement`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              sessionId,
              propertyId,
              path: location.pathname,
              engagementTime: duration
            }),
            keepalive: true,
          }).then(res => {
            console.log('📡 Fallback fetch sent:', res.status);

            socket.emit('user_disconnected', {
              sessionId,
              propertyId,
              path: location.pathname,
            });
          }).catch(err => {
            console.error('❌ Fallback fetch failed:', err);
          });
        }
      }
    };

    window.addEventListener('pagehide', handleUnload);
    window.addEventListener('beforeunload', handleUnload);
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        setTimeout(() => {
          console.log("📤 [VisibilityChange] Triggered handleUnload after short delay");
          handleUnload();
        }, 300);
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('pagehide', handleUnload);
      window.removeEventListener('beforeunload', handleUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [location.pathname]);
};