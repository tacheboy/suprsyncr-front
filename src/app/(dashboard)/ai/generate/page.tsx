'use client';

import { useState } from 'react';
import { useGenerateProductMutation } from '@/store/services/aiApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Wand2, Upload, Copy, Check, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useGetCategoriesQuery } from '@/store/services/categoryApi';

export default function ProductGeneratorPage() {
  const [sellerIntent, setSellerIntent] = useState('');
  const [preferredCategory, setPreferredCategory] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const [generateProduct, { isLoading }] = useGenerateProductMutation();
  const { data: categoriesData, isLoading: isCategoriesLoading } = useGetCategoriesQuery();
  const { toast } = useToast();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

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
    if (!sellerIntent.trim()) {
      toast({ 
        title: 'Error', 
        description: 'Please provide seller intent', 
        variant: 'destructive' 
      });
      return;
    }

    const formData = new FormData();
    formData.append('image', image);
    formData.append('request', JSON.stringify({
      sellerIntent,
      preferredCategory: preferredCategory || undefined,
    }));

    try {
      const response = await generateProduct(formData).unwrap();
      setResult(response.data);
      toast({ 
        title: 'Success!', 
        description: 'Product listing generated successfully' 
      });
    } catch (error) {
      toast({ 
        title: 'Error', 
        description: 'Failed to generate product', 
        variant: 'destructive' 
      });
    }
  };

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
        <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500">
          <Wand2 className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">AI Product Generator</h1>
          <p className="text-slate-500">Create marketplace-ready listings from a single photo</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Form */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Input Details</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Image Upload */}
            <div>
              <Label>Product Image *</Label>
              <div className="mt-2 border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:border-blue-400 transition-colors cursor-pointer">
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

            {/* Seller Intent */}
            <div>
              <Label htmlFor="sellerIntent">Describe what you want to sell *</Label>
              <Textarea
                id="sellerIntent"
                value={sellerIntent}
                onChange={(e) => setSellerIntent(e.target.value)}
                placeholder='e.g., "I want to sell these noise-canceling wireless headphones"'
                rows={3}
                required
                className="mt-1"
              />
            </div>

            {/* Preferred Category */}
            <div>
              <Label htmlFor="preferredCategory">Preferred Category (Optional)</Label>
              <Select 
                value={preferredCategory || 'none'} 
                onValueChange={(val) => setPreferredCategory(val === 'none' ? '' : val)}
              >
                <SelectTrigger id="preferredCategory" className="mt-1 bg-white">
                  <SelectValue placeholder={isCategoriesLoading ? "Loading categories..." : "Select a category"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">-- Select Category --</SelectItem>
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
              className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white"
            >
              {isLoading ? (
                <>
                  <span className="animate-spin mr-2">⚡</span>
                  Generating...
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4 mr-2" />
                  Generate Product Listing
                </>
              )}
            </Button>
          </form>
        </Card>

        {/* Results Display */}
        <Card className="p-6 overflow-y-auto max-h-[800px]">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <span>Generated Listing</span>
            {result && (
              <span className="text-xs text-green-600 font-normal">
                ✓ Generated in {result.latencyMs}ms
              </span>
            )}
          </h2>
          
          {result ? (
            <div className="space-y-4">
              {/* Note / Confidence */}
              {result.confidenceNote && (
                <div className="p-3 bg-blue-50 text-blue-800 text-sm rounded-lg flex gap-2">
                  <Info className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{result.confidenceNote}</span>
                </div>
              )}

              {/* Title */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-sm font-semibold">Suggested Title</Label>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => copyToClipboard(result.suggestedTitle, 'title')}
                  >
                    {copied === 'title' ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <p className="text-sm p-3 bg-slate-50 rounded-lg border border-slate-200 font-medium">
                  {result.suggestedTitle}
                </p>
              </div>

              {/* Grid: Brand, Category, Price */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="block text-xs text-slate-500 mb-1">Brand</span>
                  <span className="text-sm font-semibold">{result.brand}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="block text-xs text-slate-500 mb-1">Category</span>
                  <span className="text-sm font-semibold">{result.category}</span>
                </div>
                <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                  <span className="block text-xs text-green-700 mb-1">Suggested Price</span>
                  <span className="text-lg font-bold text-green-700">₹{result.mrpSuggestionInr}</span>
                </div>
              </div>

              {/* Bullet Points */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-sm font-semibold">Bullet Points</Label>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => copyToClipboard(result.bulletPoints.join('\n'), 'bullets')}
                  >
                    {copied === 'bullets' ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <ul className="space-y-2">
                  {result.bulletPoints.map((point: string, i: number) => (
                    <li 
                      key={i} 
                      className="text-sm p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-start gap-2"
                    >
                      <span className="text-blue-600 font-bold">•</span>
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

              {/* Key Features & Keywords */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-semibold mb-2 block">Key Features</Label>
                  <div className="flex flex-wrap gap-2">
                    {result.keyFeatures.map((kf: string, i: number) => (
                      <span key={i} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-md">
                        {kf}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-semibold mb-2 block">Amazon Keywords</Label>
                  <div className="flex flex-wrap gap-2">
                    {result.amazonKeywords.map((kw: string, i: number) => (
                      <span key={i} className="px-2 py-1 bg-slate-100 text-slate-700 text-xs rounded-md">
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Suggested Attributes */}
              {result.suggestedAttributes && Object.keys(result.suggestedAttributes).length > 0 && (
                <div>
                  <Label className="text-sm font-semibold mb-2 block">Category Attributes</Label>
                  <div className="grid grid-cols-2 gap-2 text-sm bg-slate-50 p-3 rounded-lg border border-slate-200">
                    {Object.entries(result.suggestedAttributes).map(([key, val]) => (
                      <div key={key} className="flex flex-col">
                        <span className="text-xs text-slate-500">{key}</span>
                        <span className="font-medium">{val as string}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center text-slate-400 py-20 flex flex-col items-center">
              <Wand2 className="h-16 w-16 mx-auto mb-4 opacity-30" />
              <p className="text-sm">
                Upload an image and describe your product to generate a listing
              </p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
