'use client';

import { useEffect, useState } from 'react';

export function useAgencySuggestions(isOpen: boolean) {
  const [agencies, setAgencies] = useState<string[]>([]);
  useEffect(() => {
    if (!isOpen) return;
    const controller = new AbortController();
    (async () => {
      try {
        const response = await fetch('/api/system/agency-suggestions', { signal: controller.signal, cache: 'no-store' });
        if (!response.ok) return;
        const result = await response.json();
        if (result.success && !controller.signal.aborted) setAgencies(result.agencies);
      } catch {
        // Suggestions are optional; manual entry remains available if Sheets is unavailable.
      }
    })();
    return () => controller.abort();
  }, [isOpen]);
  return agencies;
}
