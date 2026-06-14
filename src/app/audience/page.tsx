'use client';

import { useState } from 'react';
import { Search, Users, Bot, IndianRupee, MapPin, Calendar, Minus, Square, X } from 'lucide-react';

interface AudienceResult {
  audienceSize: number;
  explanation: string;
  filters: any;
  sampleCustomers: Array<{
    id: string;
    name: string;
    email: string;
    city: string;
    totalSpend: number;
    lastOrderDate: string | null;
  }>;
}

export default function AudienceBuilder() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AudienceResult | null>(null);
  const [error, setError] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError('');
    
    try {
      const res = await fetch('/api/segment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
      });
      
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || 'Failed to generate segment');
      
      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto w-full space-y-8 pb-20 font-sans">
      <div className="border-b-4 border-[var(--retro-border)] pb-4">
        <h1 className="text-4xl font-black text-[var(--retro-text)] tracking-tighter uppercase">Audience Builder</h1>
        <p className="text-[var(--retro-text)] font-bold mt-2 uppercase text-sm tracking-wide">Query_Engine.exe</p>
      </div>

      <div className="retro-box overflow-hidden">
        <div className="retro-window-header bg-[#b4e6ff]">
          <div className="flex items-center gap-2">
            <Search size={16} />
            <span>NATURAL_LANGUAGE_INPUT</span>
          </div>
          <div className="flex gap-1">
            <Minus size={16} className="cursor-pointer hover:bg-black hover:text-white" />
            <Square size={16} className="cursor-pointer hover:bg-black hover:text-white" />
            <X size={16} className="cursor-pointer hover:bg-black hover:text-white" />
          </div>
        </div>
        
        <div className="p-6 bg-[var(--retro-bg)]">
          <form onSubmit={handleSearch} className="flex gap-4">
            <input
              type="text"
              className="retro-input w-full p-4 font-bold placeholder-slate-500"
              placeholder="e.g. Customers from Chennai who spent over ₹5000..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="retro-btn bg-[#a8e6cf] text-[var(--retro-text)] px-8 py-4 uppercase flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
            >
              {loading ? (
                <div className="animate-spin w-5 h-5 border-4 border-[var(--retro-border)] border-t-transparent rounded-full"></div>
              ) : (
                <Bot strokeWidth={3} />
              )}
              {loading ? 'RUNNING...' : 'EXECUTE'}
            </button>
          </form>
        </div>
      </div>

      {error && (
        <div className="retro-box bg-[#ff6b6b] p-4 text-white font-bold uppercase">
          ERROR: {error}
        </div>
      )}

      {result && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="retro-box bg-[#ffcf54] p-6 col-span-1 flex flex-col justify-center items-center text-center">
              <Users className="h-12 w-12 text-[var(--retro-text)] mb-4" strokeWidth={2.5} />
              <p className="text-xs font-black uppercase tracking-wider mb-2">Results_Found</p>
              <p className="text-6xl font-black tracking-tighter">{result.audienceSize.toLocaleString()}</p>
            </div>
            
            <div className="retro-box bg-[var(--retro-panel)] p-0 col-span-2 flex flex-col">
              <div className="border-b-2 border-[var(--retro-border)] bg-[var(--retro-header)] px-4 py-2 font-bold uppercase text-xs flex items-center gap-2">
                <Bot size={14} /> AI_ANALYSIS_LOG
              </div>
              <div className="p-6 flex-1">
                <p className="text-[var(--retro-text)] font-bold text-lg leading-relaxed mb-6">{result.explanation}</p>
                
                <div className="p-4 bg-[var(--retro-bg)] border-2 border-[var(--retro-border)]">
                  <p className="text-xs font-black uppercase tracking-wider mb-3">Applied_Filters</p>
                  <div className="flex flex-wrap gap-3">
                    {Object.entries(result.filters).map(([key, val]) => {
                      if (key === 'explanation' || val === null || val === undefined) return null;
                      return (
                        <span key={key} className="px-3 py-1 bg-[var(--retro-panel)] border-2 border-[var(--retro-border)] text-[var(--retro-text)] text-sm font-bold shadow-[2px_2px_0px_0px_var(--retro-border)]">
                          {key}: {String(val)}
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="retro-box overflow-hidden bg-[var(--retro-panel)]">
            <div className="retro-window-header bg-[#ffaaa5]">
              <div className="flex items-center gap-2">
                <Users size={16} />
                <span>DATA_TABLE_VIEW</span>
              </div>
            </div>
            
            <div className="overflow-x-auto p-4 bg-[var(--retro-bg)]">
              <table className="w-full text-left border-2 border-[var(--retro-border)] bg-[var(--retro-panel)]">
                <thead>
                  <tr className="bg-black text-white text-xs uppercase font-black tracking-wider">
                    <th className="px-6 py-4 border-r border-slate-700">Customer</th>
                    <th className="px-6 py-4 border-r border-slate-700">City</th>
                    <th className="px-6 py-4 border-r border-slate-700 text-right">Total Spend</th>
                    <th className="px-6 py-4 text-right">Last Order</th>
                  </tr>
                </thead>
                <tbody className="divide-y-2 divide-[var(--retro-border)]">
                  {result.sampleCustomers.map((customer) => (
                    <tr key={customer.id} className="hover:bg-[#b4e6ff] transition-colors font-bold text-sm">
                      <td className="px-6 py-4 border-r-2 border-[var(--retro-border)]">
                        <div className="text-[var(--retro-text)] uppercase">{customer.name}</div>
                        <div className="text-[var(--retro-text-muted)] text-xs mt-1 lowercase">{customer.email}</div>
                      </td>
                      <td className="px-6 py-4 border-r-2 border-[var(--retro-border)] uppercase">
                        <div className="flex items-center gap-2 text-[var(--retro-text)]">
                          <MapPin size={16} />
                          {customer.city}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right border-r-2 border-[var(--retro-border)]">
                        <div className="flex items-center justify-end gap-1 text-[#10b981] font-black">
                          <IndianRupee size={16} />
                          {customer.totalSpend.toLocaleString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right text-slate-700 uppercase">
                        <div className="flex items-center justify-end gap-2">
                          <Calendar size={16} />
                          {customer.lastOrderDate 
                            ? new Date(customer.lastOrderDate).toLocaleDateString('en-IN') 
                            : 'NEVER'}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {result.sampleCustomers.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center font-bold text-[var(--retro-text-muted)] uppercase">
                        NO_MATCHING_RECORDS_FOUND
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
