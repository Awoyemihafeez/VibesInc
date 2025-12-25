import React, { useCallback, useState, useRef, useEffect } from 'react';
import { UploadCloud, FileSpreadsheet, Loader2, CheckCircle2 } from 'lucide-react';
import { analyzeFinancialDocument } from '../services/geminiService';
import { Transaction } from '../types';
import { read, utils } from 'xlsx';

interface ScanZoneProps {
  onTransactionsFound: (txs: Transaction[], detectedCurrency?: string) => void;
  compact?: boolean;
  categories?: string[];
  onProcessingChange?: (isProcessing: boolean) => void;
}

const ScanZone: React.FC<ScanZoneProps> = ({ onTransactionsFound, compact = false, categories = [], onProcessingChange }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const progressInterval = useRef<number | null>(null);

  useEffect(() => {
    onProcessingChange?.(isProcessing);
  }, [isProcessing, onProcessingChange]);

  useEffect(() => {
    return () => {
      if (progressInterval.current) clearInterval(progressInterval.current);
    };
  }, []);

  const startProgress = () => {
    setProgress(0);
    if (progressInterval.current) clearInterval(progressInterval.current);
    progressInterval.current = window.setInterval(() => {
      setProgress(prev => {
        if (prev >= 95) return 95;
        const remaining = 95 - prev;
        const step = Math.max(0.1, remaining * 0.05); 
        return prev + step;
      });
    }, 150);
  };

  const completeProgress = () => {
     if (progressInterval.current) clearInterval(progressInterval.current);
     setProgress(100);
  };

  const analyzeWithGemini = async (data: string, mimeType: string) => {
    try {
      const result = await analyzeFinancialDocument(data, mimeType, categories);
      completeProgress();
      
      setTimeout(() => {
          onTransactionsFound(result.transactions, result.detectedCurrency);
          setIsProcessing(false);
          setProgress(0);
      }, 1000);
    } catch (error) {
        alert("Analysis failed. Document could not be processed.");
        setIsProcessing(false);
        if (progressInterval.current) clearInterval(progressInterval.current);
    }
  };

  const processFile = async (file: File) => {
    if (!file) return;
    const isPDF = file.type === 'application/pdf';
    const isExcel = file.name.endsWith('.xlsx') || file.name.endsWith('.xls') || file.name.endsWith('.csv');

    if (!isPDF && !isExcel) {
      alert('Upload PDF or Excel/CSV only.');
      return;
    }

    setIsProcessing(true);
    startProgress();

    try {
      if (isPDF) {
        const reader = new FileReader();
        reader.onload = async () => {
          const base64Data = (reader.result as string).split(',')[1];
          await analyzeWithGemini(base64Data, 'application/pdf');
        };
        reader.readAsDataURL(file);
      } else {
        const reader = new FileReader();
        reader.onload = async (e) => {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = read(data, { type: 'array' });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const csvText = utils.sheet_to_csv(worksheet);
          await analyzeWithGemini(csvText, 'text/csv');
        };
        reader.readAsArrayBuffer(file);
      }
    } catch (err) {
      setIsProcessing(false);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  }, [categories]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  return (
    <div className={`w-full flex flex-col items-center justify-center animate-fade-in ${compact ? 'py-0' : 'p-4 space-y-4'}`}>
      <div 
        className={`
          w-full rounded-2xl border border-dashed flex flex-col items-center justify-center text-center transition-all duration-300 relative overflow-hidden
          ${isDragging ? 'border-primary-500 bg-primary-500/10 scale-[1.02]' : 'border-slate-700 bg-slate-900/50 backdrop-blur-sm'}
          ${compact ? 'p-4 min-h-[100px]' : 'p-6 aspect-[3/2] max-w-sm'}
        `}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        <div className={`flex flex-col items-center w-full transition-all duration-500`}>
          <div className={`flex items-center transition-all duration-500 ${isProcessing ? 'mb-4' : (compact ? 'gap-3 text-left w-full' : 'flex-col gap-3')}`}>
              <div className={`${isProcessing ? 'w-10 h-10' : (compact ? 'w-10 h-10' : 'w-12 h-12')} bg-slate-800/80 rounded-full flex items-center justify-center ring-1 ring-slate-700 shadow-lg shrink-0 transition-all`}>
                  {isProcessing && progress === 100 ? <CheckCircle2 className="text-emerald-400" size={20} /> : 
                   isProcessing ? <Loader2 className="animate-spin text-primary-500" size={20} /> : 
                   <UploadCloud className="text-primary-500" size={compact ? 20 : 24} />}
              </div>
              <div className={`${!isProcessing && compact ? 'flex-1' : ''}`}>
                  <h3 className={`${isProcessing ? 'text-base' : (compact ? 'text-sm' : 'text-lg')} font-bold text-white transition-all`}>
                      {isProcessing ? (progress === 100 ? 'Analysis Complete' : 'Importing Statement...') : 'Import Statements'}
                  </h3>
              </div>
          </div>

          {isProcessing ? (
            <div className="w-full max-w-[240px] flex flex-col items-center justify-center space-y-3 z-10 animate-fade-in">
               <div className="w-full bg-slate-800/80 rounded-full h-2 overflow-hidden ring-1 ring-white/5">
                  <div 
                    className={`h-full rounded-full transition-all duration-300 ease-out ${progress === 100 ? 'bg-emerald-500' : 'bg-primary-500'}`}
                    style={{ width: `${progress}%` }}
                  />
               </div>
            </div>
          ) : (
            <label className={`cursor-pointer bg-primary-600 hover:bg-primary-500 text-white rounded-lg flex items-center justify-center gap-2 transition-all font-bold shadow-lg shadow-primary-500/20 active:scale-95 animate-fade-in ${compact ? 'py-2 px-4 text-xs ml-auto' : 'py-2.5 px-6 mt-4 text-sm'}`}>
                <FileSpreadsheet size={compact ? 14 : 16} />
                Select File
                <input type="file" className="hidden" accept=".pdf,.csv,.xlsx,.xls" onChange={handleFileInput} disabled={isProcessing} />
            </label>
          )}
        </div>
      </div>
    </div>
  );
};

export default ScanZone;