'use client';

import { motion, AnimatePresence } from 'framer-motion';

export const PageTransition = ({ children }: { children: React.ReactNode }) => (
    <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="h-full w-full"
    >
        {children}
    </motion.div>
);
