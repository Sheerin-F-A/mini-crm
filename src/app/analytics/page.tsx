'use client';

import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { BarChart3, Clock, AlertCircle, RefreshCw, Minus, Square, X } from 'lucide-react';

type CampaignStats = {
  id: string;
  name: string;
  channel: string;
  status: string;
  createdAt: string;
  audienceSize: number;
  stats: {
    sent: number;
    failed: number;
    delivered: number;
    opened: number;
    clicked: number;
    converted: number;
  };
};

export default function Analytics() {
  const [campaigns, setCampaigns] = useState<CampaignStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const fetchAnalytics = async () => {
    try {
      const res = await fetch('/api/analytics');
      const data = await res.json();
      setCampaigns(data);
      if (data.length > 0 && !selectedId) {
        setSelectedId(data[0].id);
      }
    } catch (err) {
      console.error("Failed to fetch analytics", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
    
    // Auto-refresh every 3 seconds to watch the Channel Service webhooks populate live
    const interval = setInterval(fetchAnalytics, 3000);
    return () => clearInterval(interval);
  }, [selectedId]);

  const selectedCampaign = campaigns.find(c => c.id === selectedId);

  // Prepare data for the Funnel Chart with retro colors
  const chartData = selectedCampaign ? [
    { name: 'Sent', value: selectedCampaign.stats.sent, color: '#000000' }, // Black
    { name: 'Delivered', value: selectedCampaign.stats.delivered, color: '#b4e6ff' }, // Blue
    { name: 'Opened', value: selectedCampaign.stats.opened, color: '#a8e6cf' }, // Green
    { name: 'Clicked', value: selectedCampaign.stats.clicked, color: '#ffcf54' }, // Yellow
    { name: 'Converted', value: selectedCampaign.stats.converted, color: '#ffaaa5' }, // Red/Pink
  ] : [];

  // Custom retro tooltip for charts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="retro-box bg-white p-3 border-2 border-black">
          <p className="font-black uppercase text-sm mb-1">{label}</p>
          <p className="font-bold text-lg">{payload[0].value} <span className="text-xs uppercase text-slate-500">units</span></p>
        </div>
      );
    }
    return null;
  };

  if (loading && campaigns.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="retro-box p-6 bg-[#ffcf54] text-black font-bold flex items-center gap-3">
          <RefreshCw className="animate-spin" />
          FETCHING ANALYTICS...
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto w-full space-y-8 pb-20 font-sans">
      <div className="flex justify-between items-end border-b-4 border-black pb-4">
        <div>
          <h1 className="text-4xl font-black text-black tracking-tighter uppercase">Campaign Analytics</h1>
          <p className="text-black font-bold mt-2 uppercase text-sm tracking-wide">Data_Visualizer.exe</p>
        </div>
        <button 
          onClick={fetchAnalytics}
          className="retro-btn bg-white text-black px-4 py-2 flex items-center gap-2 text-sm uppercase"
        >
          <RefreshCw size={16} strokeWidth={3} /> REFRESH_DATA
        </button>
      </div>

      {campaigns.length === 0 ? (
        <div className="retro-box bg-[#f4f0eb] p-12 text-center border-2 border-black">
          <div className="mx-auto w-20 h-20 bg-white border-2 border-black rounded-full flex items-center justify-center mb-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <BarChart3 className="h-10 w-10 text-black" strokeWidth={2.5} />
          </div>
          <h3 className="text-2xl font-black text-black mb-2 uppercase">NO_DATA_FOUND</h3>
          <p className="text-black font-bold max-w-md mx-auto">
            SYSTEM REQUIRES AT LEAST ONE CAMPAIGN TO GENERATE VISUALIZATIONS.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Campaign List Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-black text-white px-3 py-2 font-black uppercase text-sm flex items-center justify-between border-2 border-black">
              <span>CAMPAIGN_LOGS</span>
            </div>
            <div className="space-y-4">
              {campaigns.map(campaign => (
                <div 
                  key={campaign.id}
                  onClick={() => setSelectedId(campaign.id)}
                  className={`p-4 cursor-pointer transition-all border-2 ${
                    selectedId === campaign.id 
                      ? 'bg-[#ffcf54] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] -translate-y-1 -translate-x-1' 
                      : 'bg-white border-black hover:bg-slate-100 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 hover:-translate-x-0.5'
                  }`}
                >
                  <h4 className="font-black text-black text-lg uppercase truncate">
                    {campaign.name}
                  </h4>
                  <div className="flex items-center gap-4 mt-3 text-sm font-bold text-black">
                    <span className="flex items-center gap-1.5">
                      <Clock size={14} strokeWidth={3} />
                      {new Date(campaign.createdAt).toLocaleDateString()}
                    </span>
                    <span className="px-2 py-0.5 bg-white border border-black text-xs uppercase">
                      {campaign.channel || 'EMAIL'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Detailed Analytics View */}
          <div className="lg:col-span-2">
            {selectedCampaign && (
              <div className="retro-box overflow-hidden bg-white">
                <div className="retro-window-header bg-[#b4e6ff]">
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2">
                      <BarChart3 size={16} />
                      <span>TELEMETRY_VIEW</span>
                    </div>
                    <div className="flex gap-1">
                      <Minus size={16} className="cursor-pointer hover:bg-black hover:text-white" />
                      <Square size={16} className="cursor-pointer hover:bg-black hover:text-white" />
                      <X size={16} className="cursor-pointer hover:bg-black hover:text-white" />
                    </div>
                  </div>
                </div>

                <div className="p-6 border-b-2 border-black bg-[#f4f0eb]">
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-3xl font-black text-black uppercase truncate max-w-xl">{selectedCampaign.name}</h2>
                      <p className="text-black font-bold mt-2">Target Volume: {selectedCampaign.audienceSize} packets</p>
                    </div>
                    {selectedCampaign.stats.failed > 0 && (
                      <div className="flex items-center gap-2 px-4 py-2 bg-[#ff6b6b] text-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] font-black text-sm uppercase">
                        <AlertCircle size={16} strokeWidth={3} />
                        {selectedCampaign.stats.failed} ERRORS
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-8 bg-white">
                  <h3 className="text-sm font-black text-black uppercase tracking-widest mb-8 border-b-2 border-black inline-block pb-1">CONVERSION_FUNNEL</h3>
                  
                  <div className="h-80 w-full mb-8">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={chartData}
                        margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#000" strokeOpacity={0.2} />
                        <XAxis 
                          dataKey="name" 
                          axisLine={{ stroke: '#000', strokeWidth: 2 }} 
                          tickLine={false} 
                          tick={{ fill: '#000', fontWeight: 'bold', fontSize: 12, textTransform: 'uppercase' }} 
                          dy={10} 
                        />
                        <YAxis 
                          axisLine={{ stroke: '#000', strokeWidth: 2 }} 
                          tickLine={false} 
                          tick={{ fill: '#000', fontWeight: 'bold', fontSize: 12 }} 
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="value" maxBarSize={80} stroke="#000" strokeWidth={2}>
                          {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-8 pt-8 border-t-2 border-black bg-[#f4f0eb] p-6 retro-box-sm">
                    {chartData.map(stat => (
                      <div key={stat.name} className="text-center bg-white border-2 border-black p-3 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                        <p className="text-3xl font-black text-black mb-1">{stat.value}</p>
                        <p className="text-[10px] font-black text-black uppercase tracking-wider">{stat.name}</p>
                      </div>
                    ))}
                  </div>
                  
                </div>
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
}
