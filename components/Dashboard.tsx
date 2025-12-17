import React, { useMemo, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, AreaChart, Area, XAxis, Tooltip } from 'recharts';
import { Transaction, TransactionType, UserProfile } from '../types';
import { COLORS } from '../constants';
import { TrendingUp, TrendingDown, Wallet, Receipt, Tags, Info } from 'lucide-react';
import ScanZone from './ScanZone';

interface DashboardProps {
  transactions: Transaction[];
  onImport: (txs: Transaction[]) => void;
  categories: string[];
  userProfile: UserProfile;
}

const Dashboard: React.FC<DashboardProps> = ({ transactions, onImport, categories, userProfile }) => {
  const [analysisTab, setAnalysisTab] = useState<'transactions' | 'categories'>('transactions');
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Summaries
  const summaries = useMemo(() => {
    const totalIncome = transactions.filter(t => t.type === TransactionType.INCOME).reduce((acc, curr) => acc + curr.amount, 0);
    const totalExpense = transactions.filter(t => t.type === TransactionType.EXPENSE).reduce((acc, curr) => acc + curr.amount, 0);
    return { totalIncome, totalExpense, netFlow: totalIncome - totalExpense };
  }, [transactions]);

  // Chart Data
  const categoryData = useMemo(() => {
    const expenses = transactions.filter(t => t.type === TransactionType.EXPENSE);
    const map = new Map<string, number>();
    expenses.forEach(t => map.set(t.category, (map.get(t.category) || 0) + t.amount));
    return Array.from(map.entries()).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 5); 
  }, [transactions]);

  const { flowData, trendColor, startEndDelta } = useMemo(() => {
    const sorted = [...transactions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const dailyMap = new Map<string, number>();
    sorted.forEach(t => {
        const impact = t.type === TransactionType.INCOME ? t.amount : -t.amount;
        dailyMap.set(t.date, (dailyMap.get(t.date) || 0) + impact);
    });
    const uniqueDates = Array.from(dailyMap.keys()).sort();
    let runningBalance = 0;
    const data = uniqueDates.map(date => {
        runningBalance += dailyMap.get(date) || 0;
        return { date: date.slice(5), fullDate: date, balance: runningBalance };
    });
    const endBalance = data.length > 0 ? data[data.length - 1].balance : 0;
    const color = endBalance >= 0 ? '#10b981' : '#f43f5e'; 
    return { flowData: data, trendColor: color, startEndDelta: endBalance };
  }, [transactions]);

  const topExpenses = useMemo(() => transactions.filter(t => t.type === TransactionType.EXPENSE).sort((a, b) => b.amount - a.amount).slice(0, 10), [transactions]);

  const categoryRanking = useMemo(() => {
    const expenses = transactions.filter(t => t.type === TransactionType.EXPENSE);
    const totalExpense = expenses.reduce((sum, t) => sum + t.amount, 0);
    const map = new Map<string, number>();
    expenses.forEach(t => map.set(t.category, (map.get(t.category) || 0) + t.amount));
    return Array.from(map.entries()).map(([name, value]) => ({ name, value, percent: totalExpense > 0 ? (value / totalExpense) * 100 : 0 })).sort((a, b) => b.value - a.value);
  }, [transactions]);

  const CustomTooltip = ({ active, payload }: any) => {
      if (active && payload && payload.length) {
      return (
          <div className="bg-slate-900 border border-slate-700 p-2 rounded-lg shadow-xl text-xs">
            <p className="text-slate-400 mb-1">{payload[0].payload.fullDate}</p>
            <p className="font-bold text-white">Balance: <span style={{ color: trendColor }}>{payload[0].value > 0 ? '+' : ''}{Number(payload[0].value).toFixed(2)}</span></p>
          </div>
      );
      }
      return null;
  };

  if (transactions.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6 space-y-6">
         {!isProcessing && (
           <div className="text-center space-y-2 mb-4 animate-fade-in">
              <h1 className="text-3xl font-bold text-white tracking-tight">Welcome to AppaFlow</h1>
              <p className="text-slate-400 text-sm">Upload a bank statement to generate instant insights.</p>
           </div>
         )}
         <ScanZone onTransactionsFound={onImport} categories={categories} onProcessingChange={setIsProcessing} />
      </div>
    );
  }

  return (
    <div className="p-3 space-y-3 pb-24 animate-fade-in">
      {!isProcessing && (
        <div className="px-1 py-2 animate-fade-in">
           <h1 className="text-2xl font-bold text-white tracking-tight">Financial Overview</h1>
           <p className="text-slate-400 text-xs">Analysis and real-time cash flow.</p>
        </div>
      )}

      <ScanZone onTransactionsFound={onImport} compact={true} categories={categories} onProcessingChange={setIsProcessing} />

      <div className={`space-y-3 transition-all duration-500 ${isProcessing ? 'opacity-20 pointer-events-none blur-sm grayscale' : 'opacity-100'}`}>
          <div className="bg-slate-900/60 backdrop-blur-sm p-4 rounded-2xl border border-slate-800/50 shadow-lg">
               <div className="flex justify-between items-center mb-1">
                  <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Net Cash Flow</span>
                  <Wallet className="text-primary-500" size={16} />
               </div>
               <div className="text-3xl font-bold text-white mb-2">
                 ${summaries.netFlow.toFixed(2)}
               </div>
               <div className="flex gap-4 text-xs font-medium">
                 <span className="flex items-center text-emerald-400 gap-1 bg-emerald-500/10 px-2 py-1 rounded-md">
                   <TrendingUp size={12} /> ${summaries.totalIncome.toFixed(0)} In
                 </span>
                 <span className="flex items-center text-rose-400 gap-1 bg-rose-500/10 px-2 py-1 rounded-md">
                   <TrendingDown size={12} /> ${summaries.totalExpense.toFixed(0)} Out
                 </span>
               </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="bg-slate-900/60 backdrop-blur-sm p-3 rounded-2xl border border-slate-800/50 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                 <h3 className="text-slate-200 font-semibold text-xs uppercase tracking-wide">Spending Distribution</h3>
              </div>
              <div className="flex items-center">
                <div className="h-28 w-28 shrink-0 relative">
                    <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        innerRadius={35}
                        outerRadius={50}
                        paddingAngle={5}
                        dataKey="value"
                        >
                        {categoryData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="transparent" />
                        ))}
                        </Pie>
                    </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <span className="text-[10px] text-slate-500 font-bold">TOP 5</span>
                    </div>
                </div>
                <div className="flex-1 pl-3 space-y-1.5 overflow-hidden">
                    {categoryData.slice(0, 3).map((cat, i) => (
                    <div key={cat.name} className="flex justify-between items-center text-[10px]">
                        <div className="flex items-center gap-2 min-w-0">
                        <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
                        <span className="text-slate-300 truncate">{cat.name}</span>
                        </div>
                        <span className="font-mono text-slate-100 font-medium">${cat.value.toFixed(0)}</span>
                    </div>
                    ))}
                </div>
              </div>
            </div>

            <div className="bg-slate-900/60 backdrop-blur-sm p-3 rounded-2xl border border-slate-800/50 relative overflow-hidden">
               <div className="flex justify-between items-start mb-2 relative z-10">
                   <div>
                      <h3 className="text-slate-200 font-semibold text-xs uppercase tracking-wide flex items-center gap-1">
                          Balance Trend <Info size={10} className="text-slate-500"/>
                      </h3>
                      <div className={`text-lg font-bold ${trendColor === '#10b981' ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {startEndDelta > 0 ? '+' : ''}${startEndDelta.toFixed(0)}
                      </div>
                   </div>
                   <div className={`p-1.5 rounded-lg ${trendColor === '#10b981' ? 'bg-emerald-500/10' : 'bg-rose-500/10'}`}>
                       {startEndDelta >= 0 ? <TrendingUp size={16} color={trendColor} /> : <TrendingDown size={16} color={trendColor} />}
                   </div>
               </div>
               
               <div className="h-24 w-full -mx-1">
                 <ResponsiveContainer width="100%" height="100%">
                   <AreaChart data={flowData} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
                     <defs>
                       <linearGradient id="colorTrend" x1="0" y1="0" x2="0" y2="1">
                         <stop offset="5%" stopColor={trendColor} stopOpacity={0.3}/>
                         <stop offset="95%" stopColor={trendColor} stopOpacity={0}/>
                       </linearGradient>
                     </defs>
                     <XAxis dataKey="date" hide />
                     <Tooltip content={<CustomTooltip />} />
                     <Area type="monotone" dataKey="balance" stroke={trendColor} strokeWidth={2} fillOpacity={1} fill="url(#colorTrend)" />
                   </AreaChart>
                 </ResponsiveContainer>
               </div>
            </div>
          </div>
          
          <div className="bg-slate-900/60 backdrop-blur-sm rounded-2xl border border-slate-800/50 overflow-hidden">
            <div className="p-3 border-b border-slate-800/50 flex justify-between items-center">
                <h3 className="text-slate-200 font-semibold text-xs uppercase tracking-wide">Cash Flow</h3>
                <div className="flex bg-slate-950/50 p-0.5 rounded-lg border border-slate-800">
                   <button 
                      onClick={() => setAnalysisTab('transactions')}
                      className={`p-1 rounded-md transition-all ${analysisTab === 'transactions' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
                   >
                      <Receipt size={14} />
                   </button>
                   <button 
                      onClick={() => setAnalysisTab('categories')}
                      className={`p-1 rounded-md transition-all ${analysisTab === 'categories' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
                   >
                      <Tags size={14} />
                   </button>
                </div>
            </div>
            <div className="max-h-[200px] overflow-y-auto scrollbar-hide">
               {analysisTab === 'transactions' ? (
                  <div className="divide-y divide-slate-800/50">
                      {topExpenses.map((t, idx) => (
                          <div key={t.id} className="p-3 flex items-center justify-between hover:bg-slate-800/30 transition-colors">
                              <div className="flex items-center gap-3">
                                  <div className="w-6 h-6 rounded-md bg-rose-500/10 flex items-center justify-center text-rose-400 font-bold text-[10px]">
                                      {idx + 1}
                                  </div>
                                  <div>
                                      <div className="text-xs font-semibold text-slate-200 truncate max-w-[140px]">{t.merchant}</div>
                                      <div className="text-[10px] text-slate-500">{t.date}</div>
                                  </div>
                              </div>
                              <div className="text-sm font-mono font-medium text-white">
                                  ${t.amount.toFixed(2)}
                              </div>
                          </div>
                      ))}
                  </div>
               ) : (
                  <div className="p-3 space-y-3">
                      {categoryRanking.map((cat, idx) => (
                          <div key={cat.name} className="space-y-1">
                              <div className="flex justify-between items-center text-xs text-slate-200">
                                  <span>{cat.name}</span>
                                  <span className="font-mono">${cat.value.toFixed(0)}</span>
                              </div>
                              <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                                  <div 
                                      className="h-full rounded-full" 
                                      style={{ width: `${cat.percent}%`, backgroundColor: COLORS[idx % COLORS.length] }}
                                  ></div>
                              </div>
                          </div>
                      ))}
                  </div>
               )}
            </div>
          </div>
      </div>
    </div>
  );
};

export default Dashboard;