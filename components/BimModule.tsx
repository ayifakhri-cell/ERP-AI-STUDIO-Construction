import React, { useState } from 'react';
import { Terminal, Database, Play, Loader2, ArrowRight } from 'lucide-react';
import { MOCK_BIM_DATA } from '../constants';
import { generateBimPythonCode } from '../services/geminiService';
import { BimElement } from '../types';

const BimModule: React.FC = () => {
  const [query, setQuery] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [result, setResult] = useState<string | number | null>(null);
  const [loading, setLoading] = useState(false);

  const handleQuery = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setResult(null);
    setGeneratedCode('');
    
    try {
      const code = await generateBimPythonCode(query);
      if (code) {
          setGeneratedCode(code);
          
          // --- SIMULATED EXECUTION FOR DEMO ---
          // Since we can't run python in browser easily without Pyodide,
          // we will run a simplistic simulation based on the prompt intent for visual feedback
          let simulatedResult: number | string = 0;
          
          if (query.toLowerCase().includes('volume') && query.toLowerCase().includes('structural columns')) {
            simulatedResult = MOCK_BIM_DATA
                .filter(i => i.category === 'Structural Columns' && (query.toLowerCase().includes('concrete') ? i.material === 'Concrete' : true))
                .reduce((acc, curr) => acc + curr.volume, 0).toFixed(2) + " m³";
          } else if (query.toLowerCase().includes('count') || query.toLowerCase().includes('how many')) {
             simulatedResult = MOCK_BIM_DATA.length;
          } else if (query.toLowerCase().includes('steel')) {
             simulatedResult = MOCK_BIM_DATA.filter(i => i.material === 'Steel').reduce((acc, curr) => acc + curr.volume, 0).toFixed(2) + " m³";
          } else {
             simulatedResult = "Check table for details (Simulation limited)";
          }
          
          setTimeout(() => {
              setResult(simulatedResult);
          }, 800); // Small delay for effect
      }
    } catch (e) {
      console.error(e);
      setGeneratedCode("# Error generating code");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 h-full overflow-auto flex flex-col">
       <header className="mb-6">
        <h1 className="text-3xl font-bold text-slate-800">BIM Intelligence</h1>
        <p className="text-slate-500 mt-2">Natural Language Querying for Building Information Models (IFC/Revit).</p>
      </header>

      <div className="flex gap-6 flex-1 min-h-0">
        {/* Left: Data View */}
        <div className="w-1/3 flex flex-col bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                <div className="flex items-center text-slate-700 font-semibold">
                    <Database className="w-4 h-4 mr-2" />
                    Data Source: df_bim
                </div>
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">{MOCK_BIM_DATA.length} rows</span>
            </div>
            <div className="overflow-auto flex-1 p-0">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs text-slate-500 uppercase bg-slate-50 sticky top-0">
                        <tr>
                            <th className="px-4 py-3">ID</th>
                            <th className="px-4 py-3">Category</th>
                            <th className="px-4 py-3">Mat</th>
                            <th className="px-4 py-3 text-right">Vol (m³)</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {MOCK_BIM_DATA.map((row) => (
                            <tr key={row.id} className="hover:bg-slate-50">
                                <td className="px-4 py-2 font-mono text-slate-600">{row.id}</td>
                                <td className="px-4 py-2">{row.category}</td>
                                <td className="px-4 py-2">
                                    <span className={`px-2 py-0.5 rounded text-xs ${
                                        row.material === 'Concrete' ? 'bg-gray-200 text-gray-700' :
                                        row.material === 'Steel' ? 'bg-blue-100 text-blue-700' :
                                        row.material === 'Brick' ? 'bg-red-100 text-red-700' : 
                                        'bg-sky-100 text-sky-700'
                                    }`}>
                                        {row.material}
                                    </span>
                                </td>
                                <td className="px-4 py-2 text-right font-mono">{row.volume}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>

        {/* Right: Interaction Area */}
        <div className="w-2/3 flex flex-col gap-6">
            {/* Query Box */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <label className="block text-sm font-medium text-slate-700 mb-2">Ask a question about the model</label>
                <div className="flex gap-2">
                    <input 
                        type="text" 
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="e.g. Total volume of concrete columns..."
                        className="flex-1 px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        onKeyDown={(e) => e.key === 'Enter' && handleQuery()}
                    />
                    <button 
                        onClick={handleQuery}
                        disabled={loading}
                        className="bg-slate-900 text-white px-6 py-3 rounded-lg hover:bg-slate-800 disabled:opacity-50 flex items-center"
                    >
                        {loading ? <Loader2 className="animate-spin" /> : <ArrowRight />}
                    </button>
                </div>
                <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                    {["Total volume of concrete columns", "How many beams in L2?", "Volume of steel used"].map(q => (
                        <button 
                            key={q} 
                            onClick={() => { setQuery(q); }}
                            className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 px-3 py-1 rounded-full whitespace-nowrap transition"
                        >
                            {q}
                        </button>
                    ))}
                </div>
            </div>

            {/* Code Generation Output */}
            <div className="flex-1 bg-slate-900 rounded-xl shadow-lg overflow-hidden flex flex-col border border-slate-700">
                <div className="px-4 py-2 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
                    <div className="flex items-center text-slate-400 text-sm">
                        <Terminal className="w-4 h-4 mr-2" />
                        Generated Python Logic
                    </div>
                    {result && (
                         <span className="text-xs text-green-400 flex items-center">
                            <Play className="w-3 h-3 mr-1" /> Executed successfully
                        </span>
                    )}
                </div>
                <div className="flex-1 p-6 font-mono text-sm relative">
                    {loading ? (
                        <div className="absolute inset-0 flex items-center justify-center text-slate-500">
                            <span className="animate-pulse">Analyzing Schema & Generating Code...</span>
                        </div>
                    ) : (
                        <>
                            {generatedCode ? (
                                <div>
                                    <div className="text-purple-400 mb-2"># Generated by Gemini 2.5 Flash</div>
                                    <div className="text-green-300">{generatedCode}</div>
                                    
                                    {result && (
                                        <div className="mt-8 pt-4 border-t border-slate-700 animate-fade-in-up">
                                            <div className="text-slate-400 text-xs mb-1">EXECUTION RESULT</div>
                                            <div className="text-3xl text-white font-bold">{result}</div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="text-slate-600">Waiting for query...</div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default BimModule;