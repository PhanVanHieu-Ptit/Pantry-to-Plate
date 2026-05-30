'use client';

const PARTICLES = [
  { emoji: '🥕', top: '12%',  left: '4%',   delay: '0s',    duration: '6s',  size: 'text-3xl' },
  { emoji: '🥦', top: '62%',  left: '7%',   delay: '1.6s',  duration: '8s',  size: 'text-2xl' },
  { emoji: '🧅', top: '22%',  left: '92%',  delay: '0.9s',  duration: '7s',  size: 'text-2xl' },
  { emoji: '🍳', top: '72%',  left: '90%',  delay: '2.3s',  duration: '5.5s',size: 'text-3xl' },
  { emoji: '🫑', top: '42%',  left: '2%',   delay: '3.2s',  duration: '7.5s',size: 'text-xl'  },
  { emoji: '🍅', top: '82%',  left: '16%',  delay: '1.1s',  duration: '6.5s',size: 'text-2xl' },
  { emoji: '🌿', top: '8%',   left: '80%',  delay: '4.1s',  duration: '8.5s',size: 'text-xl'  },
  { emoji: '🫚', top: '52%',  left: '88%',  delay: '2.7s',  duration: '6s',  size: 'text-2xl' },
  { emoji: '🧄', top: '35%',  left: '95%',  delay: '5.0s',  duration: '7s',  size: 'text-xl'  },
  { emoji: '🥚', top: '88%',  left: '75%',  delay: '0.4s',  duration: '9s',  size: 'text-xl'  },
];

export function FoodParticles() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden select-none">
      {PARTICLES.map((p, i) => (
        <span
          key={i}
          className={`absolute ${p.size} animate-float-up`}
          style={{
            top: p.top,
            left: p.left,
            animationDelay: p.delay,
            animationDuration: p.duration,
            opacity: 0.07,
          }}
        >
          {p.emoji}
        </span>
      ))}
    </div>
  );
}
