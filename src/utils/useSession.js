// useSession.js
export function getOrCreateSession() {
  const SESSION_TIMEOUT_MINUTES = 30;
  const now = Date.now();
  const stored = JSON.parse(localStorage.getItem('tracking') || '{}');

  const isExpired = !stored.lastActivity || (now - stored.lastActivity > SESSION_TIMEOUT_MINUTES * 60 * 1000);

  if (!stored.sessionId || isExpired) {
    const newSessionId = crypto.randomUUID();
    const newTrackingId = crypto.randomUUID();
    const newData = {
      sessionId: newSessionId,
      trackingId: newTrackingId,
      lastActivity: now
    };
    localStorage.setItem('tracking', JSON.stringify(newData));
    return {
      ...newData,
      propertyId: localStorage.getItem('propertyId') || null,
    };
  }

  stored.lastActivity = now;
  localStorage.setItem('tracking', JSON.stringify(stored));
  return {
    ...stored,
    propertyId: localStorage.getItem('propertyId') || null,
  };
}

export function resetSession() {
  localStorage.removeItem('tracking');
}