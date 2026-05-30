'use client';

import { useState } from 'react';
import { Lang, LangContext } from './_context/lang';

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Lang>('vi');
  return (
    <LangContext.Provider value={{ lang, setLang }}>
      <div className="min-h-screen bg-[#FAFAF7] text-zinc-800 antialiased">{children}</div>
    </LangContext.Provider>
  );
}
