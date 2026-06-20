'use client';

import { useState } from 'react';
import { useSuggestPlatformsMutation } from '@/store/services/aiApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, Zap, TrendingUp, AlertTriangle, CheckCircle, ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Recommendation {
  platform: string;
  fitScore: number;
  expectedReach: string;
  expectedMargin: string;
  rationale: string;
  pros: string[];
  cons: string[];
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
}

interface SuggestionResult {
  productName: string;
  productCategory: string;
  recommendations: Recommendation[];
  overallStrategy: string;
  pricingAdvice: string;
  latencyMs: number;
}

const priorityConfig = {
  HIGH: { label: 'Top Pick', bg: 'bg-green-50', border: 'border-green-300', badge: 'bg-green-600', scoreBg: 'bg-green-500', text: 'text-green-700' },
  MEDIUM: { label: 'Good Fit', bg: 'bg-amber-50', border: 'border-amber-300', badge: 'bg-amber-500', scoreBg: 'bg-amber-400', text: 'text-amber-700' },
  LOW: { label: 'Optional', bg: 'bg-slate-50', border: 'border-slate-200', badge: 'bg-slate-500', scoreBg: 'bg-slate-400', text: 'text-slate-600' },
};

export default function PlatformSuggesterPage() {
  const [productName, setProductName] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [result, setResult] = useState<SuggestionResult | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const [suggestPlatforms, { isLoading }] = useSuggestPlatformsMutation();
  const { toast } = useToast();

  const handleImageChange = (file: File) => {
    setImage(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) handleImageChange(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productName.trim()) {
      toast({ title: 'Error', description: 'Please enter a product name', variant: 'destructive' });
      return;
    }

    const formData = new FormData();
    formData.append('request', JSON.stringify({ productName }));
    if (image) formData.append('image', image);

    try {
      const response = await suggestPlatforms(formData).unwrap();
      setResult(response.data);
      toast({ title: '✨ Analysis complete!', description: 'AI has identified your best platforms.' });
    } catch {
      toast({ title: 'Error', description: 'Failed to analyze product', variant: 'destructive' });
    }
  };

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">

      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 p-8 text-white shadow-2xl">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNCI+PHBhdGggZD0iTTM2IDE4SDI0djEyaC02djZoNnY2aDEydi02aDZWMzBoLTZ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30"></div>
        <div className="relative flex items-start justify-between">
          <div>
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-1.5 text-sm font-semibold mb-4 border border-white/30">
              <Zap className="h-4 w-4 text-yellow-300 animate-pulse" />
              Smart Listing AI — Powered by Gemini Vision
            </div>
            <h1 className="text-4xl font-extrabold mb-2 tracking-tight">Platform Suggester</h1>
            <p className="text-lg text-white/80 max-w-xl">
              Upload your product photo, and our AI will instantly tell you <strong>where to list</strong> to maximize your profits and orders — scored across every major Indian marketplace.
            </p>
          </div>
          <div className="hidden lg:flex flex-col items-end gap-2 text-right">
            <div className="bg-white/20 rounded-xl p-4 space-y-1 backdrop-blur-sm border border-white/20">
              <div className="flex items-center gap-2 text-sm"><TrendingUp className="h-4 w-4 text-green-300" /><span>Platform Fit Scores</span></div>
              <div className="flex items-center gap-2 text-sm"><CheckCircle className="h-4 w-4 text-blue-300" /><span>Margin Estimates</span></div>
              <div className="flex items-center gap-2 text-sm"><Zap className="h-4 w-4 text-yellow-300" /><span>Priority Rankings</span></div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Input Form — 2/5 width */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="border-2 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-violet-600 text-white text-xs font-bold">1</span>
                Upload Product Photo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className={`border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer ${dragOver ? 'border-violet-500 bg-violet-50' : 'border-slate-300 hover:border-violet-400 hover:bg-violet-50/30'}`}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
              >
                <input type="file" accept="image/*" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImageChange(f); }} className="hidden" id="product-image" />
                <label htmlFor="product-image" className="cursor-pointer flex flex-col items-center gap-3">
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" className="max-h-44 rounded-lg object-contain shadow-md" />
                  ) : (
                    <>
                      <div className="p-4 bg-violet-100 rounded-full">
                        <Upload className="h-8 w-8 text-violet-500" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-700">Drop your product photo here</p>
                        <p className="text-xs text-slate-400 mt-1">or click to browse — PNG, JPG up to 10MB</p>
                      </div>
                    </>
                  )}
                </label>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-violet-600 text-white text-xs font-bold">2</span>
                Enter Product Name
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="productName" className="text-xs text-slate-500 mb-1 block">What is this product?</Label>
                <Input
                  id="productName"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  placeholder='e.g., "Wireless Noise-Canceling Headphones"'
                  className="bg-white"
                />
              </div>
              <Button
                onClick={handleSubmit}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white font-semibold shadow-lg shadow-violet-200 h-11"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <Zap className="h-4 w-4 animate-pulse" />
                    Analyzing with AI...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Zap className="h-4 w-4" />
                    Analyze & Suggest Platforms
                    <ArrowRight className="h-4 w-4" />
                  </span>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Results — 3/5 width */}
        <div className="lg:col-span-3">
          {result ? (
            <div className="space-y-4">
              {/* Strategy Banner */}
              <Card className="bg-gradient-to-r from-slate-800 to-slate-900 text-white border-0 shadow-lg">
                <CardContent className="pt-5 pb-5">
                  <div className="flex items-center gap-2 text-violet-300 text-xs font-semibold mb-2 uppercase tracking-wider">
                    <TrendingUp className="h-3.5 w-3.5" /> Overall Strategy
                  </div>
                  <p className="text-sm text-slate-200 leading-relaxed">{result.overallStrategy}</p>
                  <div className="mt-3 pt-3 border-t border-white/10">
                    <span className="text-xs text-slate-400 font-medium">💰 Pricing Advice: </span>
                    <span className="text-sm text-slate-300">{result.pricingAdvice}</span>
                  </div>
                  <div className="mt-2 text-right">
                    <span className="text-xs text-slate-500">Analyzed in {result.latencyMs}ms</span>
                  </div>
                </CardContent>
              </Card>

              {/* Platform Cards */}
              <div className="space-y-3">
                {result.recommendations.map((rec, i) => {
                  const cfg = priorityConfig[rec.priority] || priorityConfig.LOW;
                  return (
                    <Card key={i} className={`border-2 ${cfg.border} ${cfg.bg} shadow-sm hover:shadow-md transition-shadow`}>
                      <CardContent className="pt-4 pb-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                              <h3 className="font-bold text-slate-900 text-base">{rec.platform}</h3>
                              <span className={`text-white text-xs font-bold px-2 py-0.5 rounded-full ${cfg.badge}`}>{cfg.label}</span>
                            </div>

                            {/* Fit Score Bar */}
                            <div className="mb-3">
                              <div className="flex justify-between items-center mb-1">
                                <span className="text-xs text-slate-500 font-medium">Platform Fit Score</span>
                                <span className={`text-sm font-bold ${cfg.text}`}>{rec.fitScore}/100</span>
                              </div>
                              <div className="w-full h-2 bg-white/60 rounded-full overflow-hidden border border-white/80">
                                <div
                                  className={`h-full rounded-full transition-all ${cfg.scoreBg}`}
                                  style={{ width: `${rec.fitScore}%` }}
                                />
                              </div>
                            </div>

                            <p className="text-xs text-slate-600 mb-3">{rec.rationale}</p>

                            <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
                              <div className="bg-white/60 rounded-lg p-2 border border-white/80">
                                <span className="block text-slate-400 mb-0.5">Expected Reach</span>
                                <span className="font-semibold text-slate-700">{rec.expectedReach}</span>
                              </div>
                              <div className="bg-white/60 rounded-lg p-2 border border-white/80">
                                <span className="block text-slate-400 mb-0.5">Margin Estimate</span>
                                <span className="font-semibold text-slate-700">{rec.expectedMargin}</span>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <p className="text-xs font-semibold text-green-700 mb-1">✓ Pros</p>
                                <ul className="space-y-0.5">
                                  {rec.pros.map((pro, j) => <li key={j} className="text-xs text-slate-600">{pro}</li>)}
                                </ul>
                              </div>
                              <div>
                                <p className="text-xs font-semibold text-red-600 mb-1">✗ Cons</p>
                                <ul className="space-y-0.5">
                                  {rec.cons.map((con, j) => <li key={j} className="text-xs text-slate-600">{con}</li>)}
                                </ul>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          ) : (
            <Card className="border-2 h-full min-h-[400px] flex items-center justify-center border-dashed border-slate-200 bg-gradient-to-br from-slate-50 to-violet-50/30">
              <div className="text-center p-8 max-w-sm">
                <div className="mx-auto mb-4 h-16 w-16 rounded-2xl bg-gradient-to-br from-violet-100 to-purple-100 flex items-center justify-center">
                  <Zap className="h-8 w-8 text-violet-400" />
                </div>
                <h3 className="font-bold text-slate-700 mb-2">Ready to analyze your product</h3>
                <p className="text-sm text-slate-500">
                  Upload a photo and enter your product name. Our AI will identify the best Indian marketplaces for you — with fit scores, margin estimates, and strategic advice.
                </p>
                <div className="mt-4 flex flex-wrap gap-2 justify-center">
                  {['Amazon', 'Flipkart', 'Blinkit', 'Meesho', 'Myntra'].map(p => (
                    <span key={p} className="text-xs px-2 py-1 bg-white border border-slate-200 rounded-full text-slate-500 shadow-sm">{p}</span>
                  ))}
                  <span className="text-xs px-2 py-1 bg-white border border-slate-200 rounded-full text-slate-500 shadow-sm">+more</span>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
