'use client';

import { motion } from 'framer-motion';
import { useLang } from '../_context/lang';

const RECIPES = [
  { name: { vi: 'Mì Xào Bơ Tỏi', en: 'Garlic Butter Pasta' }, difficulty: { vi: 'Dễ', en: 'Easy' }, time: '20', match: 85 },
  { name: { vi: 'Cơm Chiên Trứng', en: 'Egg Fried Rice' },     difficulty: { vi: 'Dễ', en: 'Easy' }, time: '15', match: 92 },
  { name: { vi: 'Súp Rau Củ', en: 'Veggie Soup' },             difficulty: { vi: 'TB',  en: 'Med' },  time: '30', match: 70 },
];

export function MobileMockup() {
  const { lang } = useLang();
  return (
    <motion.div
      initial={{ y: 50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: 'easeOut', delay: 0.3 }}
      className="relative mx-auto w-[260px]"
    >
      {/* Glow behind phone */}
      <div className="absolute inset-0 rounded-[2.5rem] bg-brand-green/20 blur-2xl scale-110" />

      {/* Phone shell */}
      <div className="relative w-[260px] h-[520px] rounded-[2.5rem] border-[4px] border-zinc-800 bg-zinc-900 shadow-2xl overflow-hidden flex flex-col">

        {/* Status bar */}
        <div className="flex items-center justify-between px-5 pt-3 pb-1 bg-zinc-900 flex-shrink-0">
          <span className="text-white text-[11px] font-medium">9:41</span>
          <div className="w-20 h-4 bg-zinc-800 rounded-full" />
          <span className="text-white text-[11px]">●●●</span>
        </div>

        {/* App screen */}
        <div className="flex-1 bg-[#FAFAF7] flex flex-col overflow-hidden">
          {/* App header */}
          <div className="bg-brand-green px-3 py-2.5 flex items-center gap-2">
            <span className="text-base">🥕</span>
            <span className="text-white text-xs font-bold tracking-wide">Pantry Pilot</span>
          </div>

          <div className="flex-1 p-3 space-y-2 overflow-hidden">
            <p className="text-[10px] text-zinc-500 px-0.5">
              {lang === 'vi' ? 'Tìm thấy: 12 nguyên liệu' : 'Ingredients found: 12 items'}
            </p>

            {RECIPES.map((recipe, i) => (
              <motion.div
                key={recipe.name.en}
                initial={{ x: 24, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.55 + i * 0.18, duration: 0.4, ease: 'easeOut' }}
                className="bg-white rounded-xl p-2.5 shadow-sm border border-zinc-100"
              >
                <div className="flex justify-between items-start gap-1">
                  <span className="text-[11px] font-semibold text-zinc-800 leading-tight">
                    {recipe.name[lang]}
                  </span>
                  <span className="text-[9px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full flex-shrink-0 font-medium">
                    {recipe.difficulty[lang]}
                  </span>
                </div>
                <div className="flex gap-2 mt-1 text-[9px] text-zinc-400">
                  <span>⏱ {recipe.time} min</span>
                  <span>🥬 {recipe.match}% match</span>
                </div>
                <div className="mt-1.5 h-1 bg-zinc-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-brand-green-light rounded-full"
                    style={{ width: `${recipe.match}%` }}
                  />
                </div>
              </motion.div>
            ))}

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
              className="text-center text-[10px] text-brand-green font-semibold pt-1"
            >
              ✨ {lang === 'vi' ? '3 công thức từ tủ lạnh của bạn' : '3 recipes from your pantry'}
            </motion.p>
          </div>
        </div>

        {/* Home indicator */}
        <div className="bg-zinc-900 py-2 flex-shrink-0">
          <div className="w-20 h-1 bg-zinc-600 rounded-full mx-auto" />
        </div>
      </div>
    </motion.div>
  );
}
