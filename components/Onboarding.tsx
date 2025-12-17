import React, { useState } from 'react';
import { ArrowRight, Check } from 'lucide-react';

interface OnboardingProps {
  onComplete: () => void;
}

const steps = [
  {
    title: "Financial Mastery",
    desc: "Turn your raw bank exports into clear, actionable financial intelligence.",
    // Unsplash image: Financial charts / analysis
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=800"
  },
  {
    title: "Smart Import",
    desc: "Drag and drop PDF statements or Excel files. Our AI cleans and categorizes everything.",
    image: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&q=80&w=800"
  },
  {
    title: "Private by Design",
    desc: "Your financial data is sensitive. That's why we process everything locally on your device.",
    image: "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&q=80&w=800"
  }
];

const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [step, setStep] = useState(0);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col items-center justify-center p-6 text-center animate-fade-in bg-[url('https://images.unsplash.com/photo-1639322537228-f710d846310a?auto=format&fit=crop&q=80&w=1000')] bg-cover bg-center">
      <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm"></div>
      
      <div className="relative w-full max-w-sm space-y-8 z-10">
        <div className="relative aspect-[16/10] rounded-2xl overflow-hidden shadow-2xl border border-slate-700/50 group">
           <img src={steps[step].image} alt="Onboarding" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
           <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-90"></div>
           
           <div className="absolute bottom-4 left-4 right-4 text-left">
             <div className="text-xs font-bold text-primary-400 uppercase tracking-widest mb-1">Step {step + 1}</div>
             <h2 className="text-2xl font-bold text-white">{steps[step].title}</h2>
           </div>
        </div>

        <p className="text-slate-300 leading-relaxed text-sm px-2 min-h-[60px]">{steps[step].desc}</p>

        <div className="space-y-6">
            <div className="flex gap-2 justify-center">
            {steps.map((_, i) => (
                <div 
                key={i} 
                className={`h-1.5 rounded-full transition-all duration-300 ${i === step ? 'w-8 bg-primary-500' : 'w-2 bg-slate-700'}`}
                />
            ))}
            </div>

            <button 
            onClick={() => {
                if (step < steps.length - 1) setStep(s => s + 1);
                else onComplete();
            }}
            className="w-full py-4 bg-white hover:bg-slate-200 active:scale-95 transition-all rounded-xl text-slate-950 font-bold flex items-center justify-center gap-2 shadow-lg shadow-white/10"
            >
            {step === steps.length - 1 ? (
                <>Get Started <Check size={20}/></>
            ) : (
                <>Continue <ArrowRight size={20}/></>
            )}
            </button>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;