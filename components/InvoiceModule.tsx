import React, { useState, useRef } from 'react';
import { Upload, CheckCircle, AlertTriangle, FileText, Loader2, Receipt } from 'lucide-react';
import { analyzeInvoiceImage } from '../services/geminiService';
import { InvoiceData } from '../types';

const InvoiceModule: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<InvoiceData | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
      setData(null);
    }
  };

  const handleAnalyze = async () => {
    if (!preview || !file) return;
    setLoading(true);
    try {
      // Extract base64 content
      const base64Data = preview.split(',')[1];
      const result = await analyzeInvoiceImage(base64Data, file.type);
      setData(result);
    } catch (error) {
      console.error("Analysis failed", error);
      alert("Failed to analyze invoice. Check API Key or Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 h-full overflow-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">Financial Processing</h1>
        <p className="text-slate-500 mt-2">Upload vendor invoices for automated GL coding and validation.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upload Section */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <Upload className="w-5 h-5 mr-2 text-blue-600" />
            Document Upload
          </h2>
          
          <div 
            className="border-2 border-dashed border-slate-300 rounded-xl h-96 flex flex-col items-center justify-center bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer relative overflow-hidden"
            onClick={() => fileInputRef.current?.click()}
          >
            {preview ? (
              <img src={preview} alt="Invoice Preview" className="h-full w-full object-contain" />
            ) : (
              <>
                <FileText className="w-16 h-16 text-slate-300 mb-4" />
                <p className="text-slate-500 font-medium">Click to upload Invoice (Image)</p>
                <p className="text-xs text-slate-400 mt-2">Supports JPG, PNG, WEBP</p>
              </>
            )}
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*"
              onChange={handleFileChange}
            />
          </div>

          <button 
            onClick={handleAnalyze}
            disabled={!file || loading}
            className={`mt-6 w-full py-3 rounded-lg font-semibold flex items-center justify-center transition-all ${
              !file || loading 
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200'
            }`}
          >
            {loading ? <Loader2 className="animate-spin mr-2" /> : 'Process Invoice'}
          </button>
        </div>

        {/* Results Section */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
            Extracted Data
          </h2>

          {data ? (
            <div className="space-y-6 animate-fade-in">
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-100">
                 <div>
                    <p className="text-xs text-slate-500 uppercase font-bold">Confidence Score</p>
                    <div className="flex items-center mt-1">
                        <div className="h-2 w-24 bg-gray-200 rounded-full overflow-hidden mr-3">
                            <div 
                                className={`h-full ${data.confidence_score > 0.8 ? 'bg-green-500' : 'bg-yellow-500'}`} 
                                style={{ width: `${data.confidence_score * 100}%` }} 
                            />
                        </div>
                        <span className="font-mono font-bold">{(data.confidence_score * 100).toFixed(0)}%</span>
                    </div>
                 </div>
                 {data.confidence_score < 0.7 && (
                     <div className="flex items-center text-amber-600 text-sm bg-amber-50 px-3 py-1 rounded-full">
                         <AlertTriangle className="w-4 h-4 mr-1" />
                         Human Review Needed
                     </div>
                 )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 border border-slate-100 rounded-lg">
                    <p className="text-xs text-slate-400 uppercase">Vendor Name</p>
                    <p className="text-lg font-medium text-slate-800">{data.vendor_name}</p>
                </div>
                <div className="p-3 border border-slate-100 rounded-lg">
                    <p className="text-xs text-slate-400 uppercase">Invoice ID</p>
                    <p className="text-lg font-medium text-slate-800">{data.invoice_id}</p>
                </div>
                <div className="p-3 border border-slate-100 rounded-lg">
                    <p className="text-xs text-slate-400 uppercase">Total Amount</p>
                    <p className="text-lg font-medium text-slate-800">{data.currency} {data.total_amount?.toLocaleString()}</p>
                </div>
                <div className="p-3 border border-slate-100 rounded-lg">
                    <p className="text-xs text-slate-400 uppercase">Date Issued</p>
                    <p className="text-lg font-medium text-slate-800">{data.date_issued}</p>
                </div>
              </div>

              <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg">
                <p className="text-xs text-blue-500 uppercase font-bold mb-1">AI Suggestion</p>
                <div className="flex justify-between items-center">
                    <div>
                        <p className="text-sm text-blue-800">GL Account</p>
                        <p className="text-xl font-bold text-blue-900">{data.suggested_gl_account}</p>
                    </div>
                    <button className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700">
                        Approve Entry
                    </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-400">
               {loading ? (
                   <div className="text-center">
                       <Loader2 className="w-12 h-12 animate-spin mx-auto text-blue-500 mb-4" />
                       <p>Extracting entities from pixels...</p>
                   </div>
               ) : (
                   <>
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                        <Receipt className="w-8 h-8 text-slate-300" />
                    </div>
                    <p>No data extracted yet.</p>
                   </>
               )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InvoiceModule;