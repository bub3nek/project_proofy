'use client';

import { motion } from 'framer-motion';

interface AutoFilterBarProps {
    stores: string[];
    tags: string[];
    onStoreSelect: (store: string) => void;
    onTagSelect: (tag: string) => void;
    onReset: () => void;
}

export function AutoFilterBar({ stores, tags, onStoreSelect, onTagSelect, onReset }: AutoFilterBarProps) {
    if (!stores.length && !tags.length) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-wrap gap-3 items-center mb-6"
        >
            <button className="pixel-btn pixel-btn-green text-[10px]" onClick={onReset}>
                CLEAR AUTO FILTERS
            </button>
            {stores.map((store) => (
                <button
                    key={store}
                    onClick={() => onStoreSelect(store)}
                    className="pixel-btn pixel-btn-cyan text-[10px]"
                >
                    {store}
                </button>
            ))}
            {tags.map((tag) => (
                <button
                    key={tag}
                    onClick={() => onTagSelect(tag)}
                    className="pixel-btn pixel-btn-magenta text-[10px]"
                >
                    #{tag}
                </button>
            ))}
        </motion.div>
    );
}
