'use client';

import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { getCSRFToken, initCSRFInterceptor } from '@/lib/middleware/csrf-interceptor';

interface CSRFFormProps extends React.FormHTMLAttributes<HTMLFormElement> {
  children: ReactNode;
}

/**
 * Form wrapper that automatically includes CSRF token
 * Usage: <CSRFForm onSubmit={handleSubmit}><input name="field" /></CSRFForm>
 */
export function CSRFForm({ children, onSubmit, ...props }: CSRFFormProps) {
  const [token, setToken] = useState<string>('');

  useEffect(() => {
    async function getToken() {
      let cachedToken = getCSRFToken();
      if (!cachedToken) {
        cachedToken = await initCSRFInterceptor();
      }
      if (cachedToken) {
        setToken(cachedToken);
      }
    }

    getToken();
  }, []);

  return (
    <form {...props} onSubmit={onSubmit}>
      {token && <input type="hidden" name="csrf-token" value={token} />}
      {children}
    </form>
  );
}
