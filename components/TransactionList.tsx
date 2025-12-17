import React, { useMemo, useState } from 'react';
import { Transaction, TransactionType } from '../types';
import { ArrowDownLeft, ArrowUpRight, Search } from 'lucide-react';

interface TransactionListProps {
  transactions: Transaction[];
  categories: string[];
}

const TransactionList: React.FC<TransactionListProps> = ({ transactions, categories }) => {
  const [filter, setFilter] = useState('');

  // 1. Filter and sort by date first
  const filtered = useMemo(() => {
    return transactions.filter(t => 
      t.merchant.toLowerCase().includes(filter.toLowerCase()) || 
      t.category.toLowerCase().includes(filter.toLowerCase()) ||
      (t.subCategory && t.subCategory.toLowerCase().includes(filter.toLowerCase()))
    ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, filter]);

  // 2. Group by category
  const grouped = useMemo(() => {
    const groups: Record<string, Transaction[]> = {};
    filtered.forEach(t => {
      if (!groups[t.category]) groups[t.category] = [];
      groups[t.category].push(t);
    });
    return groups;
  }, [filtered]);

  // 3. Sort categories for display (predefined order + alphabetical for others)
  const sortedCategories = useMemo(() => {
    return Object.keys(grouped).sort((a, b) => {
        const idxA = categories.indexOf(a);
        const idxB = categories.indexOf(b);
        // Prioritize known categories in order
        if (idxA >= 0 && idxB >= 0) return idxA - idxB;
        if (idxA >= 0) return -1;
        if (idxB >= 0) return 1;
        // Alphabetical for unknown categories
        return a.localeCompare(b);
    });
  }, [grouped, categories]);

  return (
    <div className="h-full flex flex-col animate-fade-in p-4 pb-24">
      {/* Search Header */}
      <div className="sticky top-0 z-20 bg-slate-950 pb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <input 
            type="text" 
            placeholder="Search transactions..." 
            className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
        </div>
      </div>

      {/* Grouped List */}
      <div className="flex-1 overflow-y-auto min-h-0 space-y-6 scrollbar-hide">
        {filtered.length === 0 ? (
            <div className="text-center text-slate-500 mt-10">No transactions found</div>
        ) : (
            sortedCategories.map(category => {
                // Calculate total for this group to display in header
                const groupTotal = grouped[category].reduce((sum, t) => {
                    // Income adds, Expense subtracts for net flow representation, 
                    // or we can just sum absolute values. Let's do net flow.
                    return t.type === TransactionType.INCOME ? sum + t.amount : sum - t.amount;
                }, 0);
                
                return (
                    <div key={category} className="space-y-3">
                        {/* Sticky Category Header */}
                        <div className="flex items-center justify-between px-1 sticky top-0 bg-slate-950/95 backdrop-blur-sm py-2 z-10 border-b border-white/5">
                             <h3 className="text-xs font-bold text-primary-300 uppercase tracking-wider flex items-center gap-2">
                                {category}
                                <span className="bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded-md text-[10px] font-mono">
                                    {grouped[category].length}
                                </span>
                             </h3>
                             <span className={`text-xs font-mono font-medium ${groupTotal >= 0 ? 'text-emerald-400' : 'text-slate-400'}`}>
                                {groupTotal > 0 ? '+' : ''}{groupTotal.toFixed(2)}
                             </span>
                        </div>
                        
                        {/* Transactions in Group */}
                        <div className="space-y-2">
                            {grouped[category].map((t) => (
                                <div key={t.id} className="bg-slate-900/40 p-3 rounded-xl flex items-center justify-between border border-slate-800/30 hover:bg-slate-900/60 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${t.type === TransactionType.INCOME ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                                            {t.type === TransactionType.INCOME ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
                                        </div>
                                        <div>
                                            <div className="font-semibold text-sm text-white">{t.merchant}</div>
                                            <div className="text-[10px] text-slate-400 flex items-center gap-1">
                                            <span>{t.date}</span>
                                            {t.subCategory && (
                                                <>
                                                <span>•</span>
                                                <span className="text-primary-400">{t.subCategory}</span>
                                                </>
                                            )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className={`font-mono text-sm font-medium ${t.type === TransactionType.INCOME ? 'text-emerald-400' : 'text-slate-200'}`}>
                                        {t.type === TransactionType.INCOME ? '+' : '-'}${t.amount.toFixed(2)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )
            })
        )}
      </div>
    </div>
  );
};

export default TransactionList;