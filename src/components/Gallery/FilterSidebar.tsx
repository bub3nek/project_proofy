import { FilterOptions } from '@/types';
import { Card } from '../ui/Card';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Filter, X } from 'lucide-react';

interface FilterSidebarProps {
    filters: FilterOptions;
    onFilterChange: (filters: FilterOptions) => void;
    stores: string[];
    tags: string[];
    isOpen: boolean;
    onClose: () => void;
}

export function FilterSidebar({
    filters,
    onFilterChange,
    stores,
    tags,
    isOpen,
    onClose,
}: FilterSidebarProps) {
    const handleStoreChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        onFilterChange({
            ...filters,
            stores: value ? [value] : undefined,
        });
    };

    const handleDateChange = (type: 'start' | 'end', value: string) => {
        onFilterChange({
            ...filters,
            dateRange: {
                start: type === 'start' ? value : filters.dateRange?.start || '',
                end: type === 'end' ? value : filters.dateRange?.end || '',
            },
        });
    };

    const clearFilters = () => {
        onFilterChange({});
    };

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 lg:hidden"
                    onClick={onClose}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed lg:sticky top-0 right-0 lg:top-24 h-full lg:h-[calc(100vh-8rem)] w-80 bg-[var(--bg-dark)] border-l-2 lg:border-2 border-[var(--border-color)] p-6 z-50 transition-transform duration-300 overflow-y-auto ${isOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
                    }`}
            >
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-2 text-[var(--neon-magenta)]">
                        <Filter size={20} />
                        <h2 className="text-lg font-['Press_Start_2P']">FILTERS</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="lg:hidden text-[var(--text-muted)] hover:text-[var(--neon-magenta)]"
                    >
                        <X size={24} />
                    </button>
                </div>

                <div className="space-y-8">
                    {/* Store Filter */}
                    <div className="space-y-3">
                        <label className="text-[var(--neon-cyan)] font-['VT323'] text-xl">
                            STORE LOCATION
                        </label>
                        <Select
                            value={filters.stores?.[0] || ''}
                            onChange={handleStoreChange}
                            options={[
                                { value: '', label: 'ALL STORES' },
                                ...stores.map((store) => ({ value: store, label: store })),
                            ]}
                        />
                    </div>

                    {/* Date Range */}
                    <div className="space-y-3">
                        <label className="text-[var(--neon-cyan)] font-['VT323'] text-xl">
                            DATE RANGE
                        </label>
                        <div className="space-y-2">
                            <Input
                                type="date"
                                value={filters.dateRange?.start || ''}
                                onChange={(e) => handleDateChange('start', e.target.value)}
                                className="text-sm"
                            />
                            <Input
                                type="date"
                                value={filters.dateRange?.end || ''}
                                onChange={(e) => handleDateChange('end', e.target.value)}
                                className="text-sm"
                            />
                        </div>
                    </div>

                    {/* Tags */}
                    <div className="space-y-3">
                        <label className="text-[var(--neon-cyan)] font-['VT323'] text-xl">
                            TAGS
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {tags.map((tag) => {
                                const isSelected = filters.tags?.includes(tag);
                                return (
                                    <button
                                        key={tag}
                                        onClick={() => {
                                            const currentTags = filters.tags || [];
                                            const newTags = isSelected
                                                ? currentTags.filter((t) => t !== tag)
                                                : [...currentTags, tag];
                                            onFilterChange({ ...filters, tags: newTags });
                                        }}
                                        className={`px-3 py-1 text-sm border transition-all duration-200 font-['VT323'] ${isSelected
                                                ? 'border-[var(--neon-magenta)] bg-[var(--neon-magenta)] text-black'
                                                : 'border-[var(--text-muted)] text-[var(--text-muted)] hover:border-[var(--neon-magenta)] hover:text-[var(--neon-magenta)]'
                                            }`}
                                    >
                                        {tag}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Clear Button */}
                    <Button
                        variant="pink"
                        className="w-full mt-8"
                        onClick={clearFilters}
                    >
                        RESET FILTERS
                    </Button>
                </div>
            </aside>
        </>
    );
}
