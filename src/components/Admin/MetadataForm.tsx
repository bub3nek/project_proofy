'use client';

import { Input } from '@/components/ui/Input';

interface MetadataFormProps {
    store: string;
    date: string;
    tags: string;
    notes: string;
    onChange: (updates: Partial<Record<'store' | 'date' | 'tags' | 'notes', string>>) => void;
    week?: number | null;
}

export function MetadataForm({ store, date, tags, notes, onChange, week }: MetadataFormProps) {
    return (
        <div className="space-y-3">
            <label className="block text-[var(--text-muted)] font-['VT323'] text-sm">STORE</label>
            <Input
                placeholder="Store Name"
                value={store}
                onChange={(event) => onChange({ store: event.target.value.toUpperCase() })}
            />

            <label className="block text-[var(--text-muted)] font-['VT323'] text-sm">DATE</label>
            <Input type="date" value={date} onChange={(event) => onChange({ date: event.target.value })} />

            {week && (
                <p className="text-[var(--neon-green)] font-['VT323'] text-sm">Week automatically set to {week}</p>
            )}

            <label className="block text-[var(--text-muted)] font-['VT323'] text-sm">TAGS (comma separated)</label>
            <Input
                placeholder="DISPLAY, WINDOW"
                value={tags}
                onChange={(event) => onChange({ tags: event.target.value })}
            />

            <label className="block text-[var(--text-muted)] font-['VT323'] text-sm">NOTES</label>
            <textarea
                className="pixel-input w-full h-24 resize-none"
                placeholder="Add context..."
                value={notes}
                onChange={(event) => onChange({ notes: event.target.value })}
            />
        </div>
    );
}
