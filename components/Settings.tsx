import React, { useState } from 'react';
import { CategorizationRule, UserProfile } from '../types';
import { CURRENCIES } from '../constants';
import { Plus, Trash2, Wand2, PlayCircle, CornerDownRight, User, Sparkles, Camera, Loader2, Search, List, Edit2, X, Check, ChevronDown, ChevronUp } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

interface SettingsProps {
  rules: CategorizationRule[];
  onUpdateRules: (rules: CategorizationRule[]) => void;
  onApplyRules: () => void;
  userProfile: UserProfile;
  onUpdateProfile: (profile: UserProfile) => void;
  categories: string[];
  onUpdateCategories: (categories: string[]) => void;
}

const Settings: React.FC<SettingsProps> = ({ 
    rules, onUpdateRules, onApplyRules, 
    userProfile, onUpdateProfile,
    categories, onUpdateCategories
}) => {
  const [expandedSection, setExpandedSection] = useState<string | null>('general');
  
  // Rules State
  const [newKeyword, setNewKeyword] = useState('');
  const [newCategory, setNewCategory] = useState(categories[0] || 'Uncategorized');
  const [newSubCategory, setNewSubCategory] = useState('');
  const [isApplied, setIsApplied] = useState(false);

  // Profile State
  const [isUploading, setIsUploading] = useState(false);
  const [currencySearch, setCurrencySearch] = useState('');

  // Category State
  const [newCategoryInput, setNewCategoryInput] = useState('');
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editCategoryInput, setEditCategoryInput] = useState('');

  const toggleSection = (section: string) => {
    setExpandedSection(prev => prev === section ? null : section);
  };

  const handleAddRule = () => {
    if (!newKeyword.trim()) return;
    const newRule: CategorizationRule = {
      id: uuidv4(),
      keyword: newKeyword.trim(),
      category: newCategory,
      subCategory: newSubCategory.trim() || undefined
    };
    onUpdateRules([...rules, newRule]);
    setNewKeyword('');
    setNewSubCategory('');
  };

  const handleDeleteRule = (id: string) => {
    onUpdateRules(rules.filter(r => r.id !== id));
  };

  const handleApply = () => {
    onApplyRules();
    setIsApplied(true);
    setTimeout(() => setIsApplied(false), 2000);
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      const reader = new FileReader();
      reader.onloadend = () => {
        // Simulate network delay for UX
        setTimeout(() => {
          onUpdateProfile({ ...userProfile, avatar: reader.result as string });
          setIsUploading(false);
        }, 800);
      };
      reader.readAsDataURL(file);
    }
  };

  // Category Handlers
  const handleAddCategory = () => {
      const trimmed = newCategoryInput.trim();
      if (!trimmed || categories.includes(trimmed)) return;
      onUpdateCategories([...categories, trimmed]);
      setNewCategoryInput('');
  };

  const handleDeleteCategory = (cat: string) => {
      if(confirm(`Delete category "${cat}"? Transactions will remain but might show as unknown.`)) {
          onUpdateCategories(categories.filter(c => c !== cat));
      }
  };

  const startEditingCategory = (cat: string) => {
      setEditingCategory(cat);
      setEditCategoryInput(cat);
  };

  const saveEditedCategory = () => {
      if(!editingCategory || !editCategoryInput.trim()) return;
      const updated = categories.map(c => c === editingCategory ? editCategoryInput.trim() : c);
      onUpdateCategories(updated);
      setEditingCategory(null);
      setEditCategoryInput('');
  };

  const filteredCurrencies = CURRENCIES.filter(c => 
    c.code.toLowerCase().includes(currencySearch.toLowerCase()) || 
    c.label.toLowerCase().includes(currencySearch.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col p-4 pb-24 animate-fade-in overflow-y-auto scrollbar-hide">
      <h2 className="text-2xl font-bold text-white mb-6">Settings</h2>
      
      <div className="space-y-4">
          
          {/* 1. Profile Section */}
          <div className={`bg-slate-900/60 rounded-2xl border border-slate-800 overflow-hidden transition-all duration-300 ${expandedSection === 'general' ? 'ring-1 ring-primary-500/50 shadow-lg' : ''}`}>
              <button 
                  onClick={() => toggleSection('general')} 
                  className="w-full flex items-center justify-between p-4 hover:bg-slate-800/30 transition-colors"
              >
                  <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                          <User size={20} />
                      </div>
                      <div className="text-left">
                          <h3 className="font-bold text-slate-200">Profile & Data</h3>
                          <p className="text-xs text-slate-500">Avatar, currency, user details</p>
                      </div>
                  </div>
                  {expandedSection === 'general' ? <ChevronUp size={18} className="text-slate-400"/> : <ChevronDown size={18} className="text-slate-500"/>}
              </button>
              
              {expandedSection === 'general' && (
                  <div className="p-4 pt-0 border-t border-white/5 mt-2 animate-fade-in">
                      <div className="pt-4 space-y-6">
                        {/* Profile Picture */}
                        <div className="flex flex-col items-center">
                            <div className="relative group cursor-pointer mb-2">
                                <div className="w-20 h-20 rounded-full bg-slate-800 overflow-hidden ring-4 ring-slate-900 shadow-xl flex items-center justify-center">
                                    {isUploading ? (
                                        <Loader2 className="animate-spin text-primary-500" size={24} />
                                    ) : userProfile.avatar ? (
                                        <img src={userProfile.avatar} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        <User size={32} className="text-slate-600" />
                                    )}
                                </div>
                                <label className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                    <Camera className="text-white" size={20} />
                                    <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} />
                                </label>
                            </div>
                            <p className="text-slate-500 text-[10px]">Tap to change</p>
                        </div>

                        {/* User Inputs */}
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs text-slate-500 mb-1.5 block uppercase tracking-wide font-semibold">Display Name</label>
                                <input 
                                    type="text" 
                                    value={userProfile.name}
                                    onChange={(e) => onUpdateProfile({ ...userProfile, name: e.target.value })}
                                    className="w-full bg-slate-950/80 border border-slate-700/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary-500 transition-colors text-sm"
                                    placeholder="Your Name"
                                />
                            </div>

                            <div>
                                <label className="text-xs text-slate-500 mb-1.5 block uppercase tracking-wide font-semibold">Primary Currency</label>
                                <div className="relative mb-3">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
                                    <input 
                                        type="text" 
                                        placeholder="Search currency..." 
                                        value={currencySearch}
                                        onChange={(e) => setCurrencySearch(e.target.value)}
                                        className="w-full bg-slate-950/80 border border-slate-700/50 rounded-xl pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:border-primary-500 transition-colors"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-2 max-h-[180px] overflow-y-auto pr-1">
                                    {filteredCurrencies.map(curr => (
                                        <button
                                            key={curr.code}
                                            onClick={() => onUpdateProfile({ ...userProfile, currency: curr.code })}
                                            className={`
                                                flex items-center gap-2 p-2 rounded-lg border transition-all
                                                ${userProfile.currency === curr.code 
                                                    ? 'bg-primary-500/10 border-primary-500/50 text-white' 
                                                    : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:bg-slate-800'}
                                            `}
                                        >
                                            <span className="w-6 h-6 rounded bg-slate-800 flex items-center justify-center text-xs font-bold shrink-0">
                                                {curr.symbol}
                                            </span>
                                            <span className="text-xs font-medium">{curr.code}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                      </div>
                  </div>
              )}
          </div>

          {/* 2. Categories Section */}
          <div className={`bg-slate-900/60 rounded-2xl border border-slate-800 overflow-hidden transition-all duration-300 ${expandedSection === 'categories' ? 'ring-1 ring-emerald-500/50 shadow-lg' : ''}`}>
              <button 
                  onClick={() => toggleSection('categories')} 
                  className="w-full flex items-center justify-between p-4 hover:bg-slate-800/30 transition-colors"
              >
                  <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                          <List size={20} />
                      </div>
                      <div className="text-left">
                          <h3 className="font-bold text-slate-200">Categories</h3>
                          <p className="text-xs text-slate-500">Manage spending types</p>
                      </div>
                  </div>
                  {expandedSection === 'categories' ? <ChevronUp size={18} className="text-slate-400"/> : <ChevronDown size={18} className="text-slate-500"/>}
              </button>

              {expandedSection === 'categories' && (
                  <div className="p-4 pt-0 border-t border-white/5 mt-2 animate-fade-in">
                      <div className="pt-4">
                           <div className="flex gap-2 mb-4">
                               <input 
                                 type="text" 
                                 placeholder="New category..." 
                                 className="flex-1 bg-slate-950/80 border border-slate-700/50 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
                                 value={newCategoryInput}
                                 onChange={(e) => setNewCategoryInput(e.target.value)}
                                 onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
                               />
                               <button 
                                 onClick={handleAddCategory}
                                 disabled={!newCategoryInput.trim()}
                                 className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl px-3 py-2 transition-all"
                               >
                                 <Plus size={18} />
                               </button>
                           </div>

                           <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                               {categories.map(cat => (
                                   <div key={cat} className="bg-slate-950/30 p-2.5 rounded-xl border border-slate-800/50 flex items-center justify-between group">
                                       {editingCategory === cat ? (
                                           <div className="flex items-center gap-2 flex-1 mr-2">
                                               <input 
                                                 type="text" 
                                                 className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-sm text-white focus:outline-none"
                                                 value={editCategoryInput}
                                                 onChange={(e) => setEditCategoryInput(e.target.value)}
                                                 autoFocus
                                               />
                                               <button onClick={saveEditedCategory} className="p-1.5 bg-emerald-500/10 text-emerald-400 rounded hover:bg-emerald-500/20"><Check size={14}/></button>
                                               <button onClick={() => setEditingCategory(null)} className="p-1.5 bg-slate-700/50 text-slate-400 rounded hover:bg-slate-700"><X size={14}/></button>
                                           </div>
                                       ) : (
                                           <span className="font-medium text-slate-300 text-sm ml-1">{cat}</span>
                                       )}

                                       {editingCategory !== cat && (
                                        <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                                            <button 
                                                onClick={() => startEditingCategory(cat)}
                                                className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 transition-colors"
                                            >
                                                <Edit2 size={14} />
                                            </button>
                                            <button 
                                                onClick={() => handleDeleteCategory(cat)}
                                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                       )}
                                   </div>
                               ))}
                           </div>
                      </div>
                  </div>
              )}
          </div>

          {/* 3. Automation Section */}
          <div className={`bg-slate-900/60 rounded-2xl border border-slate-800 overflow-hidden transition-all duration-300 ${expandedSection === 'rules' ? 'ring-1 ring-amber-500/50 shadow-lg' : ''}`}>
              <button 
                  onClick={() => toggleSection('rules')} 
                  className="w-full flex items-center justify-between p-4 hover:bg-slate-800/30 transition-colors"
              >
                  <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400">
                          <Sparkles size={20} />
                      </div>
                      <div className="text-left">
                          <h3 className="font-bold text-slate-200">Automation</h3>
                          <p className="text-xs text-slate-500">Smart categorization rules</p>
                      </div>
                  </div>
                  {expandedSection === 'rules' ? <ChevronUp size={18} className="text-slate-400"/> : <ChevronDown size={18} className="text-slate-500"/>}
              </button>

              {expandedSection === 'rules' && (
                  <div className="p-4 pt-0 border-t border-white/5 mt-2 animate-fade-in">
                      <div className="pt-4">
                           <div className="flex justify-between items-center mb-3">
                                <p className="text-xs text-slate-500">Rules applied on import</p>
                                <button 
                                    onClick={handleApply}
                                    className={`
                                        flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all
                                        ${isApplied ? 'bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/50' : 'bg-white/5 hover:bg-white/10 text-white ring-1 ring-white/10'}
                                    `}
                                >
                                    <PlayCircle size={12} />
                                    {isApplied ? 'Applied' : 'Run Now'}
                                </button>
                           </div>

                           {/* New Rule Form */}
                           <div className="bg-slate-950/40 p-3 rounded-xl border border-amber-500/20 mb-4 space-y-2">
                                <div className="grid grid-cols-1 gap-2">
                                    <input 
                                      type="text" 
                                      placeholder="If merchant contains..." 
                                      className="w-full bg-slate-900 border border-slate-700/50 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                                      value={newKeyword}
                                      onChange={(e) => setNewKeyword(e.target.value)}
                                    />
                                    <div className="flex gap-2">
                                        <select 
                                            className="flex-1 bg-slate-900 border border-slate-700/50 rounded-lg px-2 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                                            value={newCategory}
                                            onChange={(e) => setNewCategory(e.target.value)}
                                        >
                                            {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                        </select>
                                        <button 
                                            onClick={handleAddRule}
                                            disabled={!newKeyword.trim()}
                                            className="bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white rounded-lg px-3 py-1 text-xs font-bold"
                                        >
                                            <Plus size={16} />
                                        </button>
                                    </div>
                                </div>
                           </div>

                           {/* Rules List */}
                           <div className="space-y-2 max-h-[240px] overflow-y-auto pr-1">
                                {rules.length === 0 ? (
                                  <div className="text-center py-4 text-slate-500 text-xs italic">No rules yet.</div>
                                ) : (
                                  rules.map(rule => (
                                    <div key={rule.id} className="bg-slate-950/30 p-2.5 rounded-xl border border-slate-800/50 flex items-center justify-between group">
                                      <div className="flex-1 min-w-0 pr-2">
                                        <div className="flex items-center gap-1.5 text-xs text-slate-300">
                                          <span className="opacity-50 text-[10px] uppercase">If</span>
                                          <span className="font-bold text-white truncate max-w-[100px]">"{rule.keyword}"</span>
                                          <span className="opacity-50 text-[10px] uppercase">Then</span>
                                          <span className="text-amber-400 font-medium truncate">{rule.category}</span>
                                        </div>
                                      </div>
                                      <button 
                                        onClick={() => handleDeleteRule(rule.id)}
                                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                                      >
                                        <Trash2 size={14} />
                                      </button>
                                    </div>
                                  ))
                                )}
                           </div>
                      </div>
                  </div>
              )}
          </div>

      </div>
    </div>
  );
};

export default Settings;