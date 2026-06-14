'use client';

import { useEffect, useState } from 'react';
import { Users, ShoppingBag, Send, IndianRupee, Sparkles, ArrowRight, Activity, X, Minus, Square } from 'lucide-react';

interface Stats {
  totalCustomers: number;
  totalOrders: number;
  totalCampaigns: number;
  totalRevenue: number;
  aiOpportunities: Array<{
    title: string;
    audienceSize: number;
    potentialRevenue: number;
    suggestedAction: string;
  }>;
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/stats')
      .then(res => res.json())
      .then(data => {
        setStats(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to load stats", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <div className="retro-box p-6 bg-[#ffcf54] text-black font-bold flex items-center gap-3">
          <Activity className="animate-spin" />
          LOADING SYSTEM DATA...
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="p-8">
        <div className="retro-box p-6 bg-[#ff6b6b] text-white font-bold border-2 border-black">
          SYSTEM ERROR: FAILED TO LOAD DASHBOARD DATA.
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto w-full space-y-8 font-sans">
      <div className="flex justify-between items-end border-b-4 border-black pb-4">
        <div>
          <h1 className="text-4xl font-black text-black tracking-tighter uppercase">Overview</h1>
          <p className="text-black font-bold mt-2 uppercase text-sm tracking-wide">Sys_Admin_Dashboard.exe</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatWindow title="Customers" value={stats.totalCustomers.toLocaleString()} icon={Users} bg="bg-[#b4e6ff]" />
        <StatWindow title="Orders" value={stats.totalOrders.toLocaleString()} icon={ShoppingBag} bg="bg-[#a8e6cf]" />
        <StatWindow title="Campaigns" value={stats.totalCampaigns.toLocaleString()} icon={Send} bg="bg-[#ffd3b6]" />
        <StatWindow title="Revenue" value={`₹${stats.totalRevenue.toLocaleString()}`} icon={IndianRupee} bg="bg-[#ffaaa5]" />
      </div>

      {/* AI Opportunity Discovery */}
      <div className="retro-box overflow-hidden">
        <div className="retro-window-header bg-[#ffcf54]">
          <div className="flex items-center gap-2">
            <Sparkles size={16} />
            <span>AI_OPPORTUNITY_SCANNER.exe</span>
          </div>
          <div className="flex gap-1">
            <Minus size={16} className="cursor-pointer hover:bg-black hover:text-white" />
            <Square size={16} className="cursor-pointer hover:bg-black hover:text-white" />
            <X size={16} className="cursor-pointer hover:bg-black hover:text-white" />
          </div>
        </div>
        
        <div className="p-6 bg-white">
          <p className="font-bold mb-6 text-sm">System scan complete. 2 high-value segments identified.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {stats.aiOpportunities?.map((opp, idx) => (
              <div key={idx} className="retro-box-sm bg-[#f4f0eb] p-0 flex flex-col h-full relative group">
                <div className="bg-black text-white px-3 py-1 font-bold text-xs uppercase tracking-wide border-b-2 border-black flex justify-between">
                  <span>Target_{idx + 1}</span>
                  <span className="text-[#a8e6cf]">Match: 98%</span>
                </div>
                
                <div className="p-5 flex-1">
                  <h3 className="font-black text-black text-xl mb-4 leading-tight">{opp.title}</h3>
                  
                  <div className="grid grid-cols-2 gap-4 mb-5 border-2 border-black p-3 bg-white">
                    <div>
                      <p className="text-[10px] font-black text-slate-500 uppercase mb-1">Audience Size</p>
                      <p className="text-xl font-black text-black">{opp.audienceSize.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-500 uppercase mb-1">Est. Revenue</p>
                      <p className="text-xl font-black text-[#10b981]">₹{opp.potentialRevenue.toLocaleString()}</p>
                    </div>
                  </div>
                  
                  <div className="bg-[#ffcf54] border-2 border-black p-3 text-sm text-black font-bold flex gap-2 items-start shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                    <ArrowRight size={16} className="mt-0.5 shrink-0" strokeWidth={3} />
                    <p className="leading-snug">{opp.suggestedAction}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatWindow({ title, value, icon: Icon, bg }: any) {
  return (
    <div className={`retro-box ${bg} p-0 flex flex-col`}>
      <div className="border-b-2 border-black px-3 py-1 flex items-center justify-between font-bold text-xs uppercase tracking-wide bg-white/50">
        <span>{title}.dat</span>
        <Icon size={14} />
      </div>
      <div className="p-5 flex-1 flex flex-col justify-end">
        <p className="text-4xl font-black text-black tracking-tighter">{value}</p>
      </div>
    </div>
  );
}
