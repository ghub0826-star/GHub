import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { getTranslations, detectLanguage, setLanguage as _setLanguage, locales, LANGUAGE_NAMES } from '../i18n';
import { getTenantConfig } from '../services/tenantService';

const TenantContext = createContext(null);

export function TenantProvider({ children }) {
  const [lang, setLangState] = useState(detectLanguage());
  const [t, setT] = useState({});
  const [tenant, setTenant] = useState(null);
  const [currency, setCurrency] = useState('IDR');
  const [theme, setTheme] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load translations
  useEffect(() => {
    setT(getTranslations(lang));
  }, [lang]);

  // Listen for language change events
  useEffect(() => {
    const onChange = () => setLangState(detectLanguage());
    window.addEventListener('ghub_lang_changed', onChange);
    return () => window.removeEventListener('ghub_lang_changed', onChange);
  }, []);

  // Load tenant config from backend (resolved via header/domain)
  const refreshTenant = useCallback(async () => {
    try {
      const res = await getTenantConfig();
      const data = res.data;
      if (data && data.success) {
        setTenant(data.tenant || null);
        setTheme(data.theme || null);
        if (data.tenant) {
          if (data.tenant.default_language && locales[data.tenant.default_language]) {
            setLangState(data.tenant.default_language);
          }
          if (data.tenant.default_currency) setCurrency(data.tenant.default_currency);
        }
      }
    } catch (e) {
      // Backend may not be reachable; keep defaults
      console.warn('Tenant config load failed:', e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshTenant();
  }, [refreshTenant]);

  const setLanguage = useCallback((code) => {
    _setLanguage(code);
    setLangState(code);
  }, []);

  const value = {
    lang, t, tenant, currency, theme, loading, setLanguage,
    supportedLanguages: Object.keys(locales),
    languageNames: LANGUAGE_NAMES,
    refreshTenant,
  };

  return <TenantContext.Provider value={value}>{children}</TenantContext.Provider>;
}

export const useTenant = () => {
  const ctx = useContext(TenantContext);
  if (!ctx) throw new Error('useTenant must be used within TenantProvider');
  return ctx;
};

export default TenantContext;
