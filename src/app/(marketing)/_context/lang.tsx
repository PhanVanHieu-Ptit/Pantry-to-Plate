'use client';

import { createContext, useContext } from 'react';

export type Lang = 'vi' | 'en';

export const LangContext = createContext<{
  lang: Lang;
  setLang: (l: Lang) => void;
}>({ lang: 'vi', setLang: () => {} });

export const useLang = () => useContext(LangContext);
