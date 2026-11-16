'use client';
import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ChevronUp } from 'lucide-react';
/** Keyboard-accessible scroll shortcut that respects reduced-motion preferences. */
export function ScrollToTop(): React.JSX.Element {
  const [visible, setVisible] = useState(false);
  const reduceMotion = useReducedMotion();
  useEffect(() => {
    /** Updates shortcut visibility at the threshold. */
    const update = (): void => setVisible(window.scrollY > 300);
    update();
    window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
  }, []);
  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          aria-label="Scroll to top"
          initial={{ opacity: 0, y: reduceMotion ? 0 : 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          onClick={() => window.scrollTo({ top: 0, behavior: reduceMotion ? 'instant' : 'smooth' })}
          className="fixed bottom-6 right-6 z-40 flex h-11 w-11 items-center justify-center rounded-full bg-primary text-white shadow-lg hover:bg-primary-light"
        >
          <ChevronUp className="h-5 w-5" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
