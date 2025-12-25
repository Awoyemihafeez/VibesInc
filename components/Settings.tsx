import React, { useState, useEffect } from 'react';
import { CategorizationRule, UserProfile } from '../types';
import { CURRENCIES } from '../constants';
import { Plus, Trash2, User, Camera, Loader2, Search, Edit2, X, Check, ChevronDown, ChevronUp, Save, Filter } from 'lucide-react';
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
  
  // Rule State
  const [newKeyword, setNewKeyword] = useState('');
  const [newCategory, setNewCategory] = useState(categories[0] || 'Uncategorized');
  const [newSubCategory, setNewSubCategory] = useState('');

  // Profile Temp State
  const [tempProfile, setTempProfile] = useState<UserProfile>(userProfile);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [currencySearch, setCurrencySearch] = useState('');

  useEffect(() => {
    setTempProfile(userProfile);
  }, [userProfile]);

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

  // Fix: Added missing handleDeleteRule function
  const handleDeleteRule = (id: string) => {
    onUpdateRules(rules.filter(rule => rule.id !== id));
  };

  const handleApplyAllChanges = () => {
    setIsSaving(true);
    // Profile Update
    onUpdateProfile(tempProfile);
    // Rules Application
    onApplyRules();
    
    setTimeout(() => {
      setIsSaving(false);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    }, 800);
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      const reader = new FileReader();
      reader.onloadend = () => {
        setTempProfile({ ...tempProfile, avatar: reader.result as string });
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const filteredCurrencies = CURRENCIES.filter(c => 
    c.code.toLowerCase().includes(currencySearch.toLowerCase()) || 
    c.label.toLowerCase().includes(currencySearch.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col p-4 pb-32 animate-fade-in overflow-y-auto scrollbar-hide">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">Settings</h2>
        <button 
          onClick={handleApplyAllChanges}
          disabled={isSaving}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-all shadow-lg ${isSaved ? 'bg-emerald-500 text-white' : 'bg-primary-600 hover:bg-primary-500 text-white active:scale-95'}`}
        >
          {isSaving ? <Loader2 className="animate-spin" size={18} /> : (isSaved ? <Check size={18} /> : <Save size={18} />)}
          {isSaved ? 'Changes Applied' : 'Apply All Changes'}
        </button>
      </div>
      
      <div className="space-y-4">
          
          {/* 1. Profile */}
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
                          <h3 className="font-bold text-slate-200">Profile</h3>
                          <p className="text-xs text-slate-500">Your global preferred currency</p>
                      </div>
                  </div>
                  {expandedSection === 'general' ? <ChevronUp size={18} className="text-slate-400"/> : <ChevronDown size={18} className="text-slate-500"/>}
              </button>
              
              {expandedSection === 'general' && (
                  <div className="p-4 pt-0 border-t border-white/5 mt-2 animate-fade-in space-y-4">
                      <div className="flex flex-col items-center pt-4">
                        <div className="relative group cursor-pointer mb-3">
                          <div className="w-20 h-20 rounded-full bg-slate-800 overflow-hidden ring-4 ring-slate-900 shadow-xl flex items-center justify-center">
                              {isUploading ? <Loader2 className="animate-spin text-primary-500" size={24} /> : 
                                tempProfile.avatar ? <img src={tempProfile.avatar} alt="Profile" className="w-full h-full object-cover" /> : 
                                <User size={32} className="text-slate-600" />}
                          </div>
                          <label className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                              <Camera className="text-white" size={20} />
                              <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} />
                          </label>
                        </div>
                        <input 
                            type="text" 
                            className="bg-transparent text-center text-white font-bold text-lg outline-none border-b border-transparent focus:border-primary-500 transition-all"
                            value={tempProfile.name}
                            onChange={(e) => setTempProfile({...tempProfile, name: e.target.value})}
                            placeholder="Display Name"
                        />
                      </div>

                      <div className="space-y-3">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Default Currency</label>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
                            <input 
                                type="text" 
                                placeholder="Search currency..." 
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 pl-9 pr-4 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary-500"
                                value={currencySearch}
                                onChange={(e) => setCurrencySearch(e.target.value)}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-1 scrollbar-hide">
                            {filteredCurrencies.map(curr => (
                                <button 
                                    key={curr.code}
                                    onClick={() => setTempProfile({...tempProfile, currency: curr.code})}
                                    className={`flex items-center justify-between p-2 rounded-lg border text-xs transition-all ${tempProfile.currency === curr.code ? 'bg-primary-500/10 border-primary-500/50 text-white' : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'}`}
                                >
                                    <span className="font-bold">{curr.code}</span>
                                    <span className="opacity-60">{curr.symbol}</span>
                                </button>
                            ))}
                        </div>
                      </div>
                  </div>
              )}
          </div>

          {/* 2. Categorization Rules */}
          <div className={`bg-slate-900/60 rounded-2xl border border-slate-800 overflow-hidden transition-all duration-300 ${expandedSection === 'rules' ? 'ring-1 ring-primary-500/50 shadow-lg' : ''}`}>
              <button 
                  onClick={() => toggleSection('rules')} 
                  className="w-full flex items-center justify-between p-4 hover:bg-slate-800/30 transition-colors"
              >
                  <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400">
                          <Filter size={20} />
                      </div>
                      <div className="text-left">
                          <h3 className="font-bold text-slate-200">Auto-Categorization</h3>
                          <p className="text-xs text-slate-500">{rules.length} active matching rules</p>
                      </div>
                  </div>
                  {expandedSection === 'rules' ? <ChevronUp size={18} className="text-slate-400"/> : <ChevronDown size={18} className="text-slate-500"/>}
              </button>
              
              {expandedSection === 'rules' && (
                  <div className="p-4 pt-0 border-t border-white/5 mt-2 animate-fade-in space-y-4">
                      <div className="space-y-3 pt-4">
                          <div className="flex flex-col gap-2">
                              <input 
                                  type="text" 
                                  placeholder="Keyword (e.g. Starbucks)" 
                                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary-500"
                                  value={newKeyword}
                                  onChange={(e) => setNewKeyword(e.target.value)}
                              />
                              <div className="flex gap-2">
                                  <select 
                                      className="flex-1 bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white focus:outline-none"
                                      value={newCategory}
                                      onChange={(e) => setNewCategory(e.target.value)}
                                  >
                                      {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                  </select>
                                  <button 
                                      onClick={handleAddRule}
                                      className="bg-primary-600 hover:bg-primary-500 p-3 rounded-xl text-white shadow-lg active:scale-95 transition-all"
                                  >
                                      <Plus size={20} />
                                  </button>
                              </div>
                          </div>
                      </div>

                      <div className="space-y-2">
                          {rules.map(rule => (
                              <div key={rule.id} className="flex items-center justify-between p-3 bg-slate-950/50 rounded-xl border border-slate-800/50">
                                  <div>
                                      <div className="text-sm font-bold text-white">"{rule.keyword}"</div>
                                      <div className="text-[10px] text-primary-400 font-bold uppercase tracking-widest">{rule.category}</div>
                                  </div>
                                  <button onClick={() => handleDeleteRule(rule.id)} className="text-slate-600 hover:text-rose-500 transition-colors">
                                      <Trash2 size={16} />
                                  </button>
                              </div>
                          ))}
                      </div>
                  </div>
              )}
          </div>
      </div>
    </div>
  );
};

export default Settings;