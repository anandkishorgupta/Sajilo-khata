// src/hooks/usePosSession.ts
import { api } from '@/services/api-client';
import { useCallback, useRef, useState } from 'react';

export function usePosSession() {
  const [sessionCode, setSessionCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const hasCreatedRef = useRef(false); // guard against double-invocation

  const createSession = useCallback(async () => {
    if (hasCreatedRef.current) return;
    hasCreatedRef.current = true;
    setLoading(true);
    try {
      const { data } = await api.post('/pos-sessions');
      setSessionCode(data.data.sessionCode);
    } finally {
      setLoading(false);
    }
  }, []);

  return { sessionCode, createSession, loading };
}