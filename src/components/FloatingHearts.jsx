import { motion } from 'framer-motion';

const hearts = [
  { left: '5%', size: 22, delay: 0, duration: 11 },
  { left: '14%', size: 34, delay: 2, duration: 14 },
  { left: '27%', size: 18, delay: 5, duration: 10 },
  { left: '42%', size: 28, delay: 1, duration: 13 },
  { left: '55%', size: 16, delay: 6, duration: 12 },
  { left: '68%', size: 32, delay: 3, duration: 15 },
  { left: '79%', size: 21, delay: 7, duration: 11 },
  { left: '91%', size: 38, delay: 4, duration: 16 },
];

export default function FloatingHearts() {
  return (
    <div className="floating-hearts" aria-hidden="true">
      {hearts.map((heart, index) => (
        <motion.span
          key={index}
          className="floating-heart"
          style={{ left: heart.left, fontSize: heart.size }}
          initial={{ y: '115vh', opacity: 0, rotate: -15 }}
          animate={{ y: '-20vh', opacity: [0, 0.65, 0.45, 0], rotate: 25 }}
          transition={{
            duration: heart.duration,
            repeat: Infinity,
            delay: heart.delay,
            ease: 'linear',
          }}
        >
          ♥
        </motion.span>
      ))}
    </div>
  );
}
