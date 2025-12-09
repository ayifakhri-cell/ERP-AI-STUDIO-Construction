import React, { useState } from 'react';
import { ShieldAlert, TrendingUp, AlertTriangle, CheckCircle2, Loader2, BarChart3 } from 'lucide-react';
import { assessProjectRisk } from '../services/geminiService';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from 'recharts';

const RiskModule: React.FC = () => {
  const [projectId, setProjectId] = useState('PROJ-ALPHA-24');
  const [spend, setSpend] = useState<number>(750000);
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);

  const handleAssess = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setAnalysis(null);
    try {
        const result = await assessProjectRisk(projectId, spend);
        setAnalysis(result);
    } catch (error) {
        console.error(error);
    } finally {
        setLoading(false);
    }
  };

  const riskData = analysis?.data ? [
    { name: 'Risk Probability', value: analysis.data.probability }
  ] : [];

  return (
    <div className="p-8 h-full overflow-auto">
       <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">Predictive Risk Engine</h1>
        <p className="text-slate-500 mt-2">Real-time cost overrun prediction using Agentic Tool Use.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Input Panel */}
        <div className="lg:col-span-4 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h2 className="text-lg font-semibold mb-6">Project Parameters</h2>
            <form onSubmit={handleAssess} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Project ID</label>
                    <select 
                        value={projectId} 
                        onChange={(e) => setProjectId(e.target.value)}
                        className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="PROJ-ALPHA-24">PROJ-ALPHA-24 (High Rise)</option>
                        <option value="PROJ-BETA-09">PROJ-BETA-09 (Infrastructure)</option>
                        <option value="PROJ-GAMMA-11">PROJ-GAMMA-11 (Residential)</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Current Actual Spend ($)</label>
                    <input 
                        type="number" 
                        value={spend} 
                        onChange={(e) => setSpend(Number(e.target.value))}
                        className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                    />
                    <p className="text-xs text-slate-400 mt-1">Budget Threshold: $1,000,000</p>
                </div>
                
                <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg flex justify-center items-center transition-all"
                >
                    {loading ? <Loader2 className="animate-spin" /> : 'Run Prediction Tool'}
                </button>
            </form>

            <div className="mt-8 p-4 bg-slate-50 rounded-lg text-sm text-slate-600 border border-slate-100">
                <p className="font-semibold mb-2">How it works:</p>
                <ol className="list-decimal pl-4 space-y-1">
                    <li>Gemini receives the request.</li>
                    <li>Gemini decides to call the <code className="text-pink-600 bg-pink-50 px-1 rounded">predict_cost_risk</code> tool.</li>
                    <li>The system executes the logic locally.</li>
                    <li>Gemini interprets the probability.</li>
                </ol>
            </div>
        </div>

        {/* Output Panel */}
        <div className="lg:col-span-8 flex flex-col gap-6">
            {analysis ? (
                <>
                    {/* Key Metrics */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className={`p-6 rounded-xl border-l-4 shadow-sm bg-white ${
                            analysis.data.status === 'Critical' ? 'border-red-500' :
                            analysis.data.status === 'High' ? 'border-orange-500' : 'border-green-500'
                        }`}>
                             <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-slate-500 uppercase font-bold">Risk Level</p>
                                    <h3 className={`text-3xl font-bold mt-1 ${
                                        analysis.data.status === 'Critical' ? 'text-red-600' :
                                        analysis.data.status === 'High' ? 'text-orange-600' : 'text-green-600'
                                    }`}>{analysis.data.status}</h3>
                                </div>
                                {analysis.data.status === 'Critical' ? <AlertTriangle className="w-10 h-10 text-red-200" /> : <TrendingUp className="w-10 h-10 text-green-200" />}
                             </div>
                        </div>

                        <div className="p-6 rounded-xl bg-white shadow-sm border border-slate-200">
                             <p className="text-sm text-slate-500 uppercase font-bold">Overrun Probability</p>
                             <h3 className="text-3xl font-bold mt-1 text-slate-800">{analysis.data.probability}%</h3>
                             <p className="text-xs text-slate-400 mt-1">Confidence Interval: 95%</p>
                        </div>
                    </div>

                    {/* Chart & Analysis */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex-1 flex flex-col">
                        <h3 className="font-semibold text-slate-800 mb-4">Gemini Analysis</h3>
                        <div className="flex-1 flex gap-6">
                            <div className="w-1/3 h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={riskData}>
                                        <XAxis dataKey="name" hide />
                                        <YAxis domain={[0, 100]} />
                                        <Tooltip />
                                        <ReferenceLine y={50} stroke="#cbd5e1" strokeDasharray="3 3" />
                                        <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]}>
                                            {riskData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.value > 80 ? '#ef4444' : entry.value > 50 ? '#f97316' : '#22c55e'} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="w-2/3">
                                <div className="p-4 bg-slate-50 rounded-lg text-slate-700 leading-relaxed border border-slate-100">
                                    <p>{analysis.text}</p>
                                </div>
                                <div className="mt-4 flex justify-end">
                                    <button className="flex items-center text-blue-600 hover:text-blue-800 font-medium text-sm">
                                        <CheckCircle2 className="w-4 h-4 mr-1" />
                                        Verify & Acknowledge
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            ) : (
                <div className="h-full bg-slate-50 rounded-xl border-2 border-dashed border-slate-200 flex items-center justify-center text-slate-400">
                     <div className="text-center">
                        <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p>Select parameters and run analysis</p>
                     </div>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default RiskModule;