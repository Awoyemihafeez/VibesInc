import React, { useState, useEffect } from 'react';
import { AppView, Transaction, Insight, CategorizationRule, UserProfile } from './types';
import { NAV_ITEMS, CATEGORIES as DEFAULT_CATEGORIES } from './constants';
import Dashboard from './components/Dashboard';
import TransactionList from './components/TransactionList';
import Settings from './components/Settings';
import Onboarding from './components/Onboarding';
import InsightsBar from './components/InsightsBar';
import { generateInsights } from './services/geminiService';

const App: React.FC = () => {
  const [view, setView] = useState<AppView>(AppView.DASHBOARD);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [rules, setRules] = useState<CategorizationRule[]>([]);
  const [categories, setCategories] = useState<string[]>(DEFAULT_CATEGORIES);
  const [userProfile, setUserProfile] = useState<UserProfile>({ 
    name: 'Account', 
    currency: 'NGN' 
  });
  const [showOnboarding, setShowOnboarding] = useState(true);
  
  useEffect(() => {
    const savedTxs = localStorage.getItem('appaflow_txs');
    const hasOnboarded = localStorage.getItem('appaflow_onboarded');
    const savedRules = localStorage.getItem('appaflow_rules');
    const savedProfile = localStorage.getItem('appaflow_profile');
    const savedCategories = localStorage.getItem('appaflow_categories');
    
    if (savedTxs) setTransactions(JSON.parse(savedTxs));
    if (hasOnboarded) setShowOnboarding(false);
    if (savedRules) setRules(JSON.parse(savedRules));
    if (savedProfile) setUserProfile(JSON.parse(savedProfile));
    if (savedCategories) setCategories(JSON.parse(savedCategories));
  }, []);

  useEffect(() => {
    localStorage.setItem('appaflow_txs', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('appaflow_rules', JSON.stringify(rules));
  }, [rules]);

  useEffect(() => {
    localStorage.setItem('appaflow_profile', JSON.stringify(userProfile));
  }, [userProfile]);

  useEffect(() => {
    localStorage.setItem('appaflow_categories', JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    const fetchInsights = async () => {
        if (transactions.length > 5) {
            const results = await generateInsights(transactions);
            setInsights(results);
        }
    }
    fetchInsights();
  }, [transactions.length]);

  const applyRulesToTransactions = (txs: Transaction[], currentRules: CategorizationRule[]): Transaction[] => {
    if (currentRules.length === 0) return txs;
    return txs.map(tx => {
      const matchedRule = currentRules.find(rule => 
        tx.merchant.toLowerCase().includes(rule.keyword.toLowerCase())
      );
      if (matchedRule) {
        return { 
          ...tx, 
          category: matchedRule.category,
          subCategory: matchedRule.subCategory 
        };
      }
      return tx;
    });
  };

  const handleTransactionsFound = (newTxs: Transaction[], detectedCurrency?: string) => {
    const processedTxs = applyRulesToTransactions(newTxs, rules);
    setTransactions(prev => [...prev, ...processedTxs]);
    setView(AppView.DASHBOARD);
  };

  const handleApplyRulesRetroactively = () => {
    const updated = applyRulesToTransactions(transactions, rules);
    setTransactions(updated);
  };

  const clearData = () => {
      if(confirm('Clear all data?')) {
          setTransactions([]);
          setRules([]);
          setCategories(DEFAULT_CATEGORIES);
          localStorage.removeItem('appaflow_txs');
          localStorage.removeItem('appaflow_rules');
          localStorage.removeItem('appaflow_categories');
      }
  }

  const getBackgroundStyle = (currentView: AppView) => {
    switch (currentView) {
      case AppView.TRANSACTIONS:
        return { backgroundImage: `radial-gradient(at 50% -20%, rgba(124, 58, 237, 0.15) 0px, transparent 50%), radial-gradient(at 100% 40%, rgba(99, 102, 241, 0.1) 0px, transparent 50%), radial-gradient(at 0% 100%, rgba(56, 189, 248, 0.15) 0px, transparent 50%)` };
      case AppView.SETTINGS:
        return { backgroundImage: `radial-gradient(at 90% 10%, rgba(245, 158, 11, 0.1) 0px, transparent 50%), radial-gradient(at 10% 90%, rgba(244, 63, 94, 0.15) 0px, transparent 50%), radial-gradient(at 50% 50%, rgba(99, 102, 241, 0.05) 0px, transparent 50%)` };
      default:
        return { backgroundImage: `radial-gradient(at 0% 0%, rgba(99, 102, 241, 0.15) 0px, transparent 50%), radial-gradient(at 100% 0%, rgba(16, 185, 129, 0.1) 0px, transparent 50%), radial-gradient(at 100% 100%, rgba(244, 63, 94, 0.1) 0px, transparent 50%), radial-gradient(at 0% 100%, rgba(56, 189, 248, 0.1) 0px, transparent 50%)` };
    }
  };

  return (
    <div 
      className="h-full bg-slate-950 text-slate-50 font-sans flex flex-col relative overflow-hidden transition-[background-image] duration-700 ease-in-out bg-cover bg-fixed"
      style={getBackgroundStyle(view)}
    >
      {showOnboarding && <Onboarding onComplete={() => setShowOnboarding(false)} />}

      <header className="px-5 py-4 flex items-center justify-between bg-slate-950/40 backdrop-blur-md sticky top-0 z-20 border-b border-white/5">
        <div className="flex items-center gap-3">
           <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-indigo-600 flex items-center justify-center shadow-lg">
             <span className="font-bold text-white text-lg">A</span>
           </div>
           <h1 className="font-bold text-lg tracking-tight text-white">AppaFlow</h1>
        </div>
        <button onClick={clearData} className="text-slate-400 hover:text-rose-400 transition-colors">
            <div className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/5 text-sm">🗑</div>
        </button>
      </header>

      <main className="flex-1 overflow-hidden relative w-full mx-auto">
        <div className="h-full overflow-y-auto scrollbar-hide">
            {view === AppView.DASHBOARD && <div className="px-3 mt-3"><InsightsBar insights={insights} /></div>}
            {view === AppView.DASHBOARD && <Dashboard transactions={transactions} onImport={handleTransactionsFound} categories={categories} userProfile={userProfile} />}
            {view === AppView.TRANSACTIONS && <TransactionList transactions={transactions} categories={categories} userProfile={userProfile} />}
            {view === AppView.SETTINGS && (
              <Settings 
                rules={rules} onUpdateRules={setRules} onApplyRules={handleApplyRulesRetroactively}
                userProfile={userProfile} onUpdateProfile={setUserProfile}
                categories={categories} onUpdateCategories={setCategories}
                transactions={transactions}
              />
            )}
        </div>
      </main>

      <nav className="flex-none bg-slate-950/80 backdrop-blur-xl border-t border-white/5 flex justify-between items-center z-30 pb-safe">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            onClick={() => setView(item.id as AppView)}
            className={`flex-1 flex flex-col items-center justify-center py-3 pt-4 transition-all duration-200 relative ${view === item.id ? 'text-primary-400' : 'text-slate-500'}`}
          >
            {view === item.id && <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary-500 to-transparent shadow-[0_0_10px_rgba(99,102,241,0.5)]"></div>}
            {item.icon}
            <span className="text-[10px] font-medium mt-1">{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default App;