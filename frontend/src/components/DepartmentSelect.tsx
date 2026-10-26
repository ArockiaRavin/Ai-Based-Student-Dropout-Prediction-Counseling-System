import React, { useState, useEffect, useRef } from 'react';
import {
  Building,
  ChevronDown,
  Search,
  Check,
  X,
  AlertCircle,
  Sparkles
} from 'lucide-react';
import { DEPARTMENT_CATEGORIES, ALL_DEPARTMENTS } from '../data/departments';

interface DepartmentSelectProps {
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  label?: string;
  id?: string;
}

export const DepartmentSelect: React.FC<DepartmentSelectProps> = ({
  value,
  onChange,
  required = false,
  disabled = false,
  className = '',
  label = 'Academic Department',
  id = 'academic-department-select'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isOtherSelected, setIsOtherSelected] = useState(false);
  const [customOtherValue, setCustomOtherValue] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Initialize or synchronize value
  useEffect(() => {
    if (!value) {
      setIsOtherSelected(false);
      setCustomOtherValue('');
      return;
    }

    if (value === 'Other') {
      setIsOtherSelected(true);
    } else if (value.startsWith('Other: ')) {
      setIsOtherSelected(true);
      setCustomOtherValue(value.substring(7));
    } else if (!ALL_DEPARTMENTS.includes(value) && value !== '') {
      // If legacy or custom value not in list, treat as Other with custom text
      setIsOtherSelected(true);
      setCustomOtherValue(value);
    } else {
      setIsOtherSelected(false);
    }
  }, [value]);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen) {
      setHighlightedIndex(-1);
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    } else {
      setSearchQuery('');
    }
  }, [isOpen]);

  // Click outside listener to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filtered categories and departments based on search query
  const query = searchQuery.trim().toLowerCase();
  const filteredCategories = DEPARTMENT_CATEGORIES.map(cat => ({
    category: cat.category,
    departments: cat.departments.filter(dept => {
      if (!query) return true;
      return dept.toLowerCase().includes(query);
    })
  })).filter(cat => cat.departments.length > 0);

  // Flattened list of visible departments for keyboard navigation
  const visibleDepartments = filteredCategories.flatMap(c => c.departments);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;

    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    if (e.key === 'Escape') {
      e.preventDefault();
      setIsOpen(false);
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex(prev => (prev < visibleDepartments.length - 1 ? prev + 1 : 0));
      return;
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex(prev => (prev > 0 ? prev - 1 : visibleDepartments.length - 1));
      return;
    }

    if (e.key === 'Enter') {
      e.preventDefault();
      if (highlightedIndex >= 0 && highlightedIndex < visibleDepartments.length) {
        selectDepartment(visibleDepartments[highlightedIndex]);
      } else if (visibleDepartments.length === 1) {
        selectDepartment(visibleDepartments[0]);
      }
    }
  };

  const selectDepartment = (dept: string) => {
    if (dept === 'Other') {
      setIsOtherSelected(true);
      onChange(customOtherValue ? `Other: ${customOtherValue}` : 'Other');
    } else {
      setIsOtherSelected(false);
      setCustomOtherValue('');
      onChange(dept);
    }
    setIsOpen(false);
  };

  const handleCustomOtherChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
    setCustomOtherValue(text);
    onChange(text.trim() ? `Other: ${text.trim()}` : 'Other');
  };

  // Determine label to show in closed trigger
  const displayLabel = () => {
    if (isOtherSelected) {
      return customOtherValue ? `Other (${customOtherValue})` : 'Other (Please specify below)';
    }
    if (value && value !== 'Other') {
      return value;
    }
    return 'Select Your Academic Department';
  };

  const hasSelection = Boolean(value && value !== '');

  return (
    <div className={`space-y-2 ${className}`} ref={containerRef} id={id}>
      {label && (
        <label className="block text-xs font-medium text-slate-300">
          {label} {required && <span className="text-rose-400">*</span>}
        </label>
      )}

      {/* Dropdown Trigger Button */}
      <div className="relative">
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          className={`w-full text-left glass-input rounded-xl pl-10 pr-10 py-2.5 text-xs transition-all flex items-center justify-between border ${
            isOpen
              ? 'border-indigo-500/70 shadow-[0_0_20px_rgba(99,102,241,0.25)] bg-[#0B1224]'
              : 'border-white/10 hover:border-white/20 bg-[#0B1224]/90'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        >
          <Building className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />

          <span className={`truncate pr-2 ${hasSelection ? 'text-white font-medium' : 'text-slate-400'}`}>
            {displayLabel()}
          </span>

          <ChevronDown
            className={`w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 transition-transform duration-200 pointer-events-none ${
              isOpen ? 'rotate-180 text-indigo-400' : ''
            }`}
          />
        </button>

        {/* Dropdown Overlay Menu */}
        {isOpen && (
          <div
            className="absolute left-0 right-0 top-full mt-2 z-50 rounded-2xl border border-white/15 bg-[#070B18]/95 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150"
            style={{ maxHeight: '380px' }}
          >
            {/* Search Box */}
            <div className="p-3 border-b border-white/10 bg-white/[0.02]">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Search department or code (e.g. CSE, AI, MBBS)..."
                  className="w-full bg-[#0B1224] border border-white/10 rounded-xl pl-9 pr-8 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500/60 focus:bg-[#0E172E]"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="p-1 rounded-md text-slate-400 hover:text-white absolute right-2.5 top-1/2 -translate-y-1/2"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Department Categories and Options List */}
            <div
              ref={listRef}
              role="listbox"
              className="overflow-y-auto max-h-[300px] p-2 space-y-3 divide-y divide-white/5 scrollbar-thin scrollbar-thumb-white/10"
            >
              {filteredCategories.length > 0 ? (
                filteredCategories.map(cat => (
                  <div key={cat.category} className="pt-2 first:pt-0">
                    <div className="px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-indigo-300/80 flex items-center justify-between">
                      <span>{cat.category}</span>
                      <span className="text-slate-500 font-mono font-normal">
                        ({cat.departments.length})
                      </span>
                    </div>

                    <div className="mt-1 space-y-0.5">
                      {cat.departments.map(dept => {
                        const isSelected =
                          dept === 'Other'
                            ? isOtherSelected
                            : value === dept;
                        const isHighlighted =
                          visibleDepartments[highlightedIndex] === dept;

                        return (
                          <button
                            key={dept}
                            type="button"
                            role="option"
                            aria-selected={isSelected}
                            onClick={() => selectDepartment(dept)}
                            className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-all group ${
                              isSelected
                                ? 'bg-gradient-to-r from-indigo-600/30 to-indigo-500/20 text-white font-semibold border border-indigo-500/40 shadow-[0_0_15px_rgba(99,102,241,0.2)]'
                                : isHighlighted
                                ? 'bg-white/[0.08] text-white'
                                : 'text-slate-300 hover:text-white hover:bg-white/[0.05]'
                            }`}
                          >
                            <span className="truncate pr-2">{dept}</span>
                            {isSelected && (
                              <Check className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-6 px-4 text-center">
                  <AlertCircle className="w-6 h-6 text-slate-500 mx-auto mb-2" />
                  <p className="text-xs text-slate-300 font-medium">No matching departments found</p>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Try another keyword or select "Other" below to enter custom department name.
                  </p>
                  <button
                    type="button"
                    onClick={() => selectDepartment('Other')}
                    className="mt-3 px-3 py-1.5 rounded-lg bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 text-xs font-semibold hover:bg-indigo-600/50"
                  >
                    Select "Other" Department
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Additional Input Field if "Other" is Selected */}
      {isOtherSelected && (
        <div className="p-3.5 rounded-xl border border-indigo-500/30 bg-indigo-500/5 space-y-1.5 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center justify-between">
            <label className="block text-[11px] font-bold text-indigo-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              Specify Custom Academic Department {required && <span className="text-rose-400">*</span>}
            </label>
            <span className="text-[10px] text-slate-400 font-mono">Custom Field</span>
          </div>
          <input
            type="text"
            required={required}
            value={customOtherValue}
            onChange={handleCustomOtherChange}
            placeholder="e.g. Cognitive Science / Marine Biology / Nanotechnology"
            className="w-full glass-input rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-400 bg-[#0B1224]"
          />
          <p className="text-[10px] text-slate-400">
            This department will be linked to your faculty profile and displayed in institutional counseling records.
          </p>
        </div>
      )}
    </div>
  );
};
