import { Search } from 'lucide-react';
import { Input } from '../ui/Input';

interface SearchBarProps {
    value: string;
    onChange: (value: string) => void;
}

export function SearchBar({ value, onChange }: SearchBarProps) {
    return (
        <div className="relative w-full max-w-md">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-[var(--neon-cyan)]">
                <Search size={20} />
            </div>
            <Input
                type="text"
                placeholder="SEARCH ARCHIVES..."
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="pl-10 h-12 text-lg border-[var(--neon-cyan)] focus:shadow-[0_0_15px_var(--neon-cyan)]"
            />
            <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                <div className="w-2 h-2 bg-[var(--neon-cyan)] animate-pulse" />
            </div>
        </div>
    );
}
