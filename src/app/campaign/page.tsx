'use client';

import { useState } from 'react';
import { Sparkles, MessageSquare, Target, Zap, BarChart2, TrendingUp, Mail, MessageCircle, Smartphone, Minus, Square, X } from 'lucide-react';

type CampaignData = {
  audience: string;
  channelRecommendation: {
    channel: 'WhatsApp' | 'SMS' | 'Email' | 'RCS';
    reason: string;
  };
  message: {
    subject: string;
    body: string;
    cta: string;
  };
  predictions: {
    openRate: number;
    clickRate: number;
    conversionRate: number;
    estimatedRevenue: number;
  };
};

export default function CampaignCopilot() {
  const [goal, setGoal] = useState('');
  const [loading, setLoading] = useState(false);
  const [campaign, setCampaign] = useState<CampaignData | null>(null);
  const [error, setError] = useState('');
  
  const [isLaunching, setIsLaunching] = useState(false);
  const [launchSuccess, setLaunchSuccess] = useState(false);
  const [launchStats, setLaunchStats] = useState<{ id: string, size: number } | null>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!goal.trim()) return;

    setLoading(true);
    setError('');
    
    try {
      const res = await fetch('/api/campaign/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goal })
      });
      
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || 'Failed to generate campaign');
      
      setCampaign(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLaunch = async () => {
    if (!campaign) return;
    setIsLaunching(true);
    setError('');
    setLaunchSuccess(false);

    try {
      const res = await fetch('/api/campaign/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ campaignData: campaign })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to launch campaign');
      
      setLaunchStats({ id: data.campaignId, size: data.audienceSize });
      setLaunchSuccess(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLaunching(false);
    }
  };

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'WhatsApp': return <MessageCircle className="text-[var(--retro-text)]" />;
      case 'Email': return <Mail className="text-[var(--retro-text)]" />;
      case 'SMS':
      case 'RCS': return <Smartphone className="text-[var(--retro-text)]" />;
      default: return <MessageSquare className="text-[var(--retro-text)]" />;
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto w-full space-y-8 pb-20 font-sans">
      <div className="border-b-4 border-[var(--retro-border)] pb-4">
        <h1 className="text-4xl font-black text-[var(--retro-text)] tracking-tighter uppercase">Campaign Copilot</h1>
        <p className="text-[var(--retro-text)] font-bold mt-2 uppercase text-sm tracking-wide">Strategy_Generator.exe</p>
      </div>

      <div className="retro-box overflow-hidden">
        <div className="retro-window-header bg-[#a8e6cf]">
          <div className="flex items-center gap-2">
            <Target size={16} />
            <span>INPUT_PARAMETERS</span>
          </div>
        </div>
        <div className="p-6 bg-[var(--retro-bg)]">
          <form onSubmit={handleGenerate} className="space-y-4">
            <div>
              <label className="block text-xs font-black uppercase text-[var(--retro-text)] mb-2 tracking-wider">Campaign Goal_</label>
              <textarea
                rows={3}
                className="retro-input w-full p-4 font-bold placeholder-slate-500 resize-none"
                placeholder="e.g. Bring back inactive premium customers who haven't shopped in 3 months..."
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
              />
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading || !goal.trim()}
                className="retro-btn bg-[#ffcf54] text-[var(--retro-text)] px-8 py-3 uppercase flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="animate-spin w-4 h-4 border-4 border-[var(--retro-border)] border-t-transparent rounded-full"></div>
                ) : (
                  <Sparkles size={18} strokeWidth={3} />
                )}
                {loading ? 'PROCESSING...' : 'GENERATE STRATEGY'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {error && (
        <div className="retro-box bg-[#ff6b6b] p-4 text-white font-bold uppercase">
          ERROR: {error}
        </div>
      )}

      {campaign && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Target Audience */}
            <div className="retro-box overflow-hidden flex flex-col">
              <div className="retro-window-header bg-[var(--retro-header)]">
                <div className="flex items-center gap-2">
                  <Users size={16} />
                  <span>AUDIENCE_PROFILE</span>
                </div>
              </div>
              <div className="p-6 bg-[var(--retro-panel)] flex-1">
                <p className="text-[var(--retro-text)] font-bold leading-relaxed">{campaign.audience}</p>
              </div>
            </div>

            {/* Channel Recommendation */}
            <div className="retro-box overflow-hidden flex flex-col">
              <div className="retro-window-header bg-[var(--retro-header)]">
                <div className="flex items-center gap-2">
                  <Zap size={16} />
                  <span>CHANNEL_STRATEGY</span>
                </div>
              </div>
              <div className="p-6 bg-[var(--retro-panel)] flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-[#b4e6ff] border-2 border-[var(--retro-border)] shadow-[2px_2px_0px_0px_var(--retro-border)]">
                    {getChannelIcon(campaign.channelRecommendation.channel)}
                  </div>
                  <h3 className="font-black text-2xl uppercase tracking-tight">{campaign.channelRecommendation.channel}</h3>
                </div>
                <p className="text-[var(--retro-text)] font-bold leading-relaxed">{campaign.channelRecommendation.reason}</p>
              </div>
            </div>
          </div>

          {/* Message Copy */}
          <div className="retro-box overflow-hidden">
            <div className="retro-window-header bg-[#ffaaa5]">
              <div className="flex items-center gap-2">
                <MessageSquare size={16} />
                <span>GENERATED_COPY_ASSETS</span>
              </div>
              <div className="flex gap-1">
                <Minus size={16} className="cursor-pointer hover:bg-black hover:text-white" />
                <Square size={16} className="cursor-pointer hover:bg-black hover:text-white" />
                <X size={16} className="cursor-pointer hover:bg-black hover:text-white" />
              </div>
            </div>
            
            <div className="p-8 bg-[var(--retro-bg)] space-y-6">
              <div className="bg-[var(--retro-panel)] border-2 border-[var(--retro-border)] shadow-[4px_4px_0px_0px_var(--retro-border)] p-6">
                <p className="text-xs font-black text-[var(--retro-text-muted)] uppercase tracking-wider mb-2">Subject_Header</p>
                <div className="font-black text-xl text-[var(--retro-text)]">
                  {campaign.message.subject}
                </div>
              </div>
              
              <div className="bg-[var(--retro-panel)] border-2 border-[var(--retro-border)] shadow-[4px_4px_0px_0px_var(--retro-border)] p-6">
                <p className="text-xs font-black text-[var(--retro-text-muted)] uppercase tracking-wider mb-2">Message_Body</p>
                <div className="font-bold text-[var(--retro-text)] whitespace-pre-wrap leading-relaxed">
                  {campaign.message.body}
                </div>
              </div>
              
              <div className="flex justify-center mt-8">
                <div className="retro-box bg-[#a8e6cf] px-8 py-3 text-lg font-black uppercase inline-block">
                  {campaign.message.cta}
                </div>
              </div>
            </div>
          </div>

          {/* Predicted Performance */}
          <div className="retro-box overflow-hidden bg-black text-white border-[var(--retro-border)]">
            <div className="border-b-2 border-[var(--retro-panel)] px-4 py-2 font-bold uppercase tracking-wide flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BarChart2 size={16} />
                <span>PREDICTIVE_MODELS.dll</span>
              </div>
            </div>
            
            <div className="p-8 grid grid-cols-2 md:grid-cols-4 gap-8">
              <div>
                <p className="text-[#a8e6cf] text-xs font-black uppercase mb-2">Open_Rate</p>
                <p className="text-4xl font-black">{campaign.predictions.openRate}%</p>
              </div>
              <div>
                <p className="text-[#b4e6ff] text-xs font-black uppercase mb-2">Click_Rate</p>
                <p className="text-4xl font-black">{campaign.predictions.clickRate}%</p>
              </div>
              <div>
                <p className="text-[#ffcf54] text-xs font-black uppercase mb-2">Conv_Rate</p>
                <p className="text-4xl font-black">{campaign.predictions.conversionRate}%</p>
              </div>
              <div>
                <p className="text-[#ffaaa5] text-xs font-black uppercase mb-2">Est_Revenue</p>
                <div className="flex items-center gap-2 text-4xl font-black">
                  <TrendingUp className="h-6 w-6" strokeWidth={4} />
                  ₹{campaign.predictions.estimatedRevenue.toLocaleString()}
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end pt-4">
            {launchSuccess ? (
              <div className="retro-box bg-[#a8e6cf] text-[var(--retro-text)] px-8 py-4 flex items-center gap-3 font-black uppercase">
                <Zap size={24} fill="currentColor" />
                CAMPAIGN DEPLOYED TO {launchStats?.size} NODES
              </div>
            ) : (
              <button 
                className="retro-btn bg-[#ffcf54] text-[var(--retro-text)] px-10 py-4 uppercase flex items-center gap-3 text-lg disabled:opacity-50"
                onClick={handleLaunch}
                disabled={isLaunching}
              >
                {isLaunching ? (
                  <div className="animate-spin w-6 h-6 border-4 border-[var(--retro-border)] border-t-transparent rounded-full"></div>
                ) : (
                  <Zap size={24} fill="currentColor" strokeWidth={2} />
                )}
                {isLaunching ? 'DEPLOYING...' : 'AUTHORIZE & DEPLOY'}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
