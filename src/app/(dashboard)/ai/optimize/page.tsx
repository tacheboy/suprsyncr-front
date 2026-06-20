'use client';

import { useState } from 'react';
import { useOptimizeContentMutation } from '@/store/services/aiApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Sparkles, Upload, Copy, Check, TrendingUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useGetCategoriesQuery } from '@/store/services/categoryApi';

export default function ContentOptimizerPage() {
  // State management
  const [currentTitle, setCurrentTitle] = useState('');
  const [currentDescription, setCurrentDescription] = useState('');
  const [category, setCategory] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const [optimizeContent, { isLoading }] = useOptimizeContentMutation();
  const { data: categoriesData, isLoading: isCategoriesLoading } = useGetCategoriesQuery();
  const { toast } = useToast();

  // Image upload handler
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  // Form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!image) {
      toast({ 
        title: 'Error', 
        description: 'Please upload a product image', 
        variant: 'destructive' 
      });
      return;
    }

    const formData = new FormData();
    formData.append('image', image);
    formData.append('request', JSON.stringify({
      currentTitle,
      currentDescription,
      category,
    }));

    try {
      const response = await optimizeContent(formData).unwrap();
      setResult(response.data);
      toast({ 
        title: 'Success!', 
        description: 'Content optimized successfully' 
      });
    } catch (error) {
      toast({ 
        title: 'Error', 
        description: 'Failed to optimize content', 
        variant: 'destructive' 
      });
    }
  };

  // Copy to clipboard
  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopied(field);
    setTimeout(() => setCopied(null), 2000);
    toast({ title: 'Copied!', description: 'Text copied to clipboard' });
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500">
          <Sparkles className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">AI Content Optimizer</h1>
          <p className="text-slate-500">Transform your listings with AI-powered optimization</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Form */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <span>Current Listing</span>
            <span className="text-xs text-slate-500 font-normal">(Step 1)</span>
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Image Upload */}
            <div>
              <Label>Product Image *</Label>
              <div className="mt-2 border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:border-purple-400 transition-colors cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  id="image-upload"
                  required
                />
                <label htmlFor="image-upload" className="cursor-pointer flex flex-col items-center">
                  {imagePreview ? (
                    <img 
                      src={imagePreview} 
                      alt="Preview" 
                      className="max-h-48 mx-auto rounded-lg"
                    />
                  ) : (
                    <>
                      <Upload className="h-12 w-12 mx-auto text-slate-400 mb-3" />
                      <p className="text-sm text-slate-600 font-medium">
                        Click to upload product image
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        PNG, JPG up to 10MB
                      </p>
                    </>
                  )}
                </label>
              </div>
            </div>

            {/* Current Title */}
            <div>
              <Label htmlFor="title">Current Title *</Label>
              <Input
                id="title"
                value={currentTitle}
                onChange={(e) => setCurrentTitle(e.target.value)}
                placeholder="e.g., Wireless Headphones"
                required
                className="mt-1"
              />
            </div>

            {/* Current Description */}
            <div>
              <Label htmlFor="description">Current Description *</Label>
              <Textarea
                id="description"
                value={currentDescription}
                onChange={(e) => setCurrentDescription(e.target.value)}
                placeholder="Enter your current product description..."
                rows={4}
                required
                className="mt-1"
              />
            </div>

            {/* Category */}
            <div>
              <Label htmlFor="category">Category *</Label>
              <Select value={category} onValueChange={setCategory} required>
                <SelectTrigger id="category" className="mt-1 bg-white">
                  <SelectValue placeholder={isCategoriesLoading ? "Loading categories..." : "Select a category"} />
                </SelectTrigger>
                <SelectContent>
                  {categoriesData?.data?.map((cat: any) => (
                    <SelectItem key={cat.id} value={cat.name}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Submit Button */}
            <Button 
              type="submit" 
              disabled={isLoading} 
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
            >
              {isLoading ? (
                <>
                  <span className="animate-spin mr-2">⚡</span>
                  Optimizing with AI...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Optimize Content
                </>
              )}
            </Button>
          </form>
        </Card>

        {/* Results Display */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <span>Optimized Content</span>
            {result && (
              <span className="text-xs text-green-600 font-normal">
                ✓ Generated in {result.latencyMs}ms
              </span>
            )}
          </h2>
          
          {result ? (
            <div className="space-y-4">
              {/* SEO Score */}
              <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600 font-medium">SEO Score</p>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-2xl font-bold text-slate-400 line-through">
                        {result.seoScoreBefore}
                      </span>
                      <span className="text-4xl font-bold text-green-600">
                        {result.seoScoreAfter}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-full">
                    <TrendingUp className="w-4 h-4" />
                    <span className="font-bold">
                      +{result.seoScoreAfter - result.seoScoreBefore}
                    </span>
                  </div>
                </div>
              </div>

              {/* Optimized Title */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-sm font-semibold">Optimized Title</Label>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => copyToClipboard(result.optimisedTitle, 'title')}
                  >
                    {copied === 'title' ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <p className="text-sm p-3 bg-slate-50 rounded-lg border border-slate-200">
                  {result.optimisedTitle}
                </p>
              </div>

              {/* Bullet Points */}
              <div>
                <Label className="text-sm font-semibold mb-2 block">Bullet Points</Label>
                <ul className="space-y-2">
                  {result.bulletPoints.map((point: string, i: number) => (
                    <li 
                      key={i} 
                      className="text-sm p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-start gap-2"
                    >
                      <span className="text-purple-600 font-bold">•</span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Description */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-sm font-semibold">Description</Label>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => copyToClipboard(result.productDescription, 'description')}
                  >
                    {copied === 'description' ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <p className="text-sm p-3 bg-slate-50 rounded-lg border border-slate-200 whitespace-pre-wrap">
                  {result.productDescription}
                </p>
              </div>

              {/* Keywords */}
              <div>
                <Label className="text-sm font-semibold mb-2 block">SEO Keywords</Label>
                <div className="flex flex-wrap gap-2">
                  {result.searchKeywords.map((keyword: string, i: number) => (
                    <span 
                      key={i} 
                      className="px-3 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-full"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>

              {/* Cross Platform Impact */}
              {result.crossPlatformImpact && (
                <div className="p-4 bg-orange-50 rounded-lg border border-orange-200 mt-4">
                  <p className="text-xs font-semibold text-orange-900 mb-1">
                    🌍 Cross-Platform Impact
                  </p>
                  <p className="text-sm text-orange-700 whitespace-pre-wrap">
                    {result.crossPlatformImpact}
                  </p>
                </div>
              )}

              {/* Improvement Notes */}
              {result.improvementNotes && (
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 mt-4">
                  <p className="text-xs font-semibold text-blue-900 mb-1">
                    💡 Improvement Notes
                  </p>
                  <p className="text-sm text-blue-700 whitespace-pre-wrap">
                    {result.improvementNotes}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center text-slate-400 py-20 flex flex-col items-center">
              <Sparkles className="h-16 w-16 mx-auto mb-4 opacity-30" />
              <p className="text-sm">
                Upload an image and fill the form to get AI-optimized content
              </p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
