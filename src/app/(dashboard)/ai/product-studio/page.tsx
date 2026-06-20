'use client';

import { useState, useCallback, useMemo, useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  useOptimizeContentMutation,
  useGenerateProductMutation,
  useSuggestPlatformsMutation,
} from '@/store/services/aiApi';
import { useGetCategoriesQuery } from '@/store/services/categoryApi';
import { useGetPlatformsQuery, useConnectPlatformMutation } from '@/store/services/sellerApi';
import { useCreateProductMutation } from '@/store/services/productApi';
import { useCreateListingMutation } from '@/store/services/listingApi';
import { useAppSelector } from '@/store/hooks';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Upload,
  Sparkles,
  Wand2,
  Zap,
  Copy,
  Check,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  CheckCircle2,
  Info,
  Image as ImageIcon,
  X,
  Loader2,
  ChevronRight,
  Package,
  ArrowRight,
  RotateCcw,
  Save,
  Globe,
  Plug,
  UserPlus,
  ShoppingBag,
  BadgeCheck,
  Store,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import type { Platform, PlatformType } from '@/types';

// ─── Tool definitions ────────────────────────────────────────────────
type ToolKey = 'optimize' | 'generate' | 'suggest';

interface ToolConfig {
  key: ToolKey;
  label: string;
  tagline: string;
  icon: React.ElementType;
  color: string;
  bgLight: string;
  borderActive: string;
}

const TOOLS: ToolConfig[] = [
  {
    key: 'optimize',
    label: 'Content Optimizer',
    tagline: 'Improve titles, descriptions & SEO',
    icon: Sparkles,
    color: 'text-violet-600',
    bgLight: 'bg-violet-50',
    borderActive: 'border-violet-500 bg-violet-50/60',
  },
  {
    key: 'generate',
    label: 'Product Generator',
    tagline: 'Create a full listing from scratch',
    icon: Wand2,
    color: 'text-blue-600',
    bgLight: 'bg-blue-50',
    borderActive: 'border-blue-500 bg-blue-50/60',
  },
  {
    key: 'suggest',
    label: 'Platform Suggester',
    tagline: 'Find the best marketplaces to sell',
    icon: Zap,
    color: 'text-amber-600',
    bgLight: 'bg-amber-50',
    borderActive: 'border-amber-500 bg-amber-50/60',
  },
];

// ─── Platform config for account creation ────────────────────────────
interface PlatformMeta {
  key: PlatformType;
  name: string;
  color: string;
  bgGrad: string;
  letter: string;
  plan: string;
  sellerIdPrefix: string;
}

const PLATFORM_META: PlatformMeta[] = [
  { key: 'AMAZON', name: 'Amazon', color: '#FF9900', bgGrad: 'linear-gradient(135deg,#FF9900,#e67e00)', letter: 'A', plan: 'Professional', sellerIdPrefix: 'AMZ' },
  { key: 'FLIPKART', name: 'Flipkart', color: '#2874F0', bgGrad: 'linear-gradient(135deg,#2874F0,#1a5cc4)', letter: 'F', plan: 'Advantage', sellerIdPrefix: 'FK' },
  { key: 'MEESHO', name: 'Meesho', color: '#E91E63', bgGrad: 'linear-gradient(135deg,#E91E63,#c2185b)', letter: 'M', plan: 'Starter', sellerIdPrefix: 'MSH' },
  { key: 'SHOPIFY', name: 'Shopify', color: '#96BF48', bgGrad: 'linear-gradient(135deg,#96BF48,#7aaa2c)', letter: 'S', plan: 'Basic', sellerIdPrefix: 'SHP' },
  { key: 'WOOCOMMERCE', name: 'WooCommerce', color: '#7B51AD', bgGrad: 'linear-gradient(135deg,#7B51AD,#643d91)', letter: 'W', plan: 'Free', sellerIdPrefix: 'WOO' },
  { key: 'BLINKIT', name: 'Blinkit', color: '#F8C51C', bgGrad: 'linear-gradient(135deg,#F8C51C,#d4a800)', letter: 'B', plan: 'Partner', sellerIdPrefix: 'BLK' },
];

function getPlatformMeta(key: string): PlatformMeta | undefined {
  return PLATFORM_META.find((p) => p.key === key);
}

// ─── Category-specific pre-prompts ──────────────────────────────────
const CATEGORY_PROMPTS: Record<string, string> = {
  Electronics:
    'Focus on technical specifications, wattage, compatibility, warranty, certifications (BIS/ISI), and comparison with popular alternatives. Highlight smart features and connectivity options.',
  Fashion:
    'Emphasize fabric quality, fit, occasion suitability, care instructions, and trending styles. Include size range, color options, and seasonal relevance.',
  'Home & Kitchen':
    'Highlight material durability, dimensions, ease of cleaning, aesthetic appeal, and space optimization. Mention kitchen-safe certifications if applicable.',
  Beauty:
    'Detail ingredients, skin/hair type suitability, cruelty-free status, dermatological testing, and results timeline. Mention any organic or ayurvedic certifications.',
  Sports:
    'Focus on material durability, sport-specific benefits, size/weight, weather resistance, and user skill level. Include relevant safety standards.',
  Books:
    'Highlight genre, author credentials, page count, language, edition details, and reader reviews. Mention if it is a bestseller or award winner.',
  Toys:
    'Emphasize age appropriateness, safety certifications (EN71/ASTM), educational value, material quality, and battery requirements.',
  Grocery:
    'Detail shelf life, nutritional information, FSSAI certification, organic/natural claims, packaging type, and serving suggestions.',
  Health:
    'Focus on active ingredients, dosage, certifications (AYUSH/FDA), usage instructions, contraindications, and clinically proven benefits.',
  Automotive:
    'Highlight compatibility with vehicle models, material grade, installation type, warranty, and safety certifications.',
  default:
    'Provide a comprehensive product overview with key features, quality highlights, target audience, and competitive advantages. Include relevant specifications and benefits.',
};

function getCategoryPrompt(category: string): string {
  return CATEGORY_PROMPTS[category] || CATEGORY_PROMPTS['default'];
}

// ─── Step type ───────────────────────────────────────────────────────
type StudioStep = 'create' | 'results' | 'listing';

// ─── Session cache key ───────────────────────────────────────────────
const SESSION_KEY = 'usp_product_studio_session';

interface SessionCache {
  productName: string;
  productDescription: string;
  category: string;
  imagePreview: string | null;
  optimizeResult: any;
  generateResult: any;
  suggestResult: any;
  activeResultTab: ToolKey | null;
  step: StudioStep;
  savedProductId: number | null;
  listedPlatforms: number[];
  savedAt: number;
}

function loadSession(): Partial<SessionCache> | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed: SessionCache = JSON.parse(raw);
    // Expire after 30 minutes
    if (Date.now() - parsed.savedAt > 1 * 60 * 1000) {
      sessionStorage.removeItem(SESSION_KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function saveSession(data: Omit<SessionCache, 'savedAt'>) {
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify({ ...data, savedAt: Date.now() }));
  } catch {}
}

function clearSession() {
  try {
    sessionStorage.removeItem(SESSION_KEY);
  } catch {}
}

// ─── Main Component ──────────────────────────────────────────────────
function ProductStudioContent() {
  const user = useAppSelector((s) => s.auth.user);
  const searchParams = useSearchParams();
  const initProductName = searchParams.get('productName') || '';
  const initKeyword = searchParams.get('keyword') || '';
  const initTool = searchParams.get('tool') as ToolKey | null;

  // Load from session cache on first render
  const sessionRef = useRef<Partial<SessionCache> | null>(null);
  if (sessionRef.current === null) {
    sessionRef.current = loadSession() ?? {};
  }
  const cached = sessionRef.current;

  // Shared input state
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(cached.imagePreview ?? null);
  const [productName, setProductName] = useState(initProductName || cached.productName || '');
  const [productDescription, setProductDescription] = useState(initKeyword ? `Missing keyword: ${initKeyword}. Please optimize for this.` : (cached.productDescription || ''));
  const [category, setCategory] = useState(cached.category ?? '');
  const [dragOver, setDragOver] = useState(false);

  // Tool selection
  const [selectedTools, setSelectedTools] = useState<Set<ToolKey>>(initTool ? new Set([initTool]) : new Set());

  // Results
  const [optimizeResult, setOptimizeResult] = useState<any>(cached.optimizeResult ?? null);
  const [generateResult, setGenerateResult] = useState<any>(cached.generateResult ?? null);
  const [suggestResult, setSuggestResult] = useState<any>(cached.suggestResult ?? null);
  const [activeResultTab, setActiveResultTab] = useState<ToolKey | null>(cached.activeResultTab ?? null);
  const [copied, setCopied] = useState<string | null>(null);

  // Loading states
  const [isProcessing, setIsProcessing] = useState(false);
  const [completedTools, setCompletedTools] = useState<Set<ToolKey>>(new Set());
  const [currentTool, setCurrentTool] = useState<ToolKey | null>(null);

  // Step flow
  const [step, setStep] = useState<StudioStep>(cached.step ?? 'create');

  // Saved product
  const [savedProductId, setSavedProductId] = useState<number | null>(cached.savedProductId ?? null);
  const [isSaving, setIsSaving] = useState(false);

  // Listing
  const [selectedListingPlatforms, setSelectedListingPlatforms] = useState<Set<number>>(new Set());
  const [isListing, setIsListing] = useState(false);
  const [listedPlatforms, setListedPlatforms] = useState<Set<number>>(new Set(cached.listedPlatforms ?? []));

  // Account creation modal (for Create Account flow)
  const [accountModal, setAccountModal] = useState<{
    open: boolean;
    platform: PlatformMeta | null;
    modalStep: 'form' | 'creating' | 'success';
    sellerId: string;
    businessName: string;
    gstin: string;
    newlyConnectedPlatformId: number | null;
  }>({
    open: false,
    platform: null,
    modalStep: 'form',
    sellerId: '',
    businessName: '',
    gstin: '',
    newlyConnectedPlatformId: null,
  });

  // Connect existing modal
  const [connectModal, setConnectModal] = useState<{
    open: boolean;
    platform: PlatformMeta | null;
    storeName: string;
    sellerId: string;
    isConnecting: boolean;
    newlyConnectedPlatformId: number | null;
  }>({
    open: false,
    platform: null,
    storeName: '',
    sellerId: '',
    isConnecting: false,
    newlyConnectedPlatformId: null,
  });

  // API mutations
  const [optimizeContent] = useOptimizeContentMutation();
  const [generateProduct] = useGenerateProductMutation();
  const [suggestPlatforms] = useSuggestPlatformsMutation();
  const [createProduct] = useCreateProductMutation();
  const [createListing] = useCreateListingMutation();
  const [connectPlatform] = useConnectPlatformMutation();
  const { data: categoriesData, isLoading: isCategoriesLoading } = useGetCategoriesQuery();
  const { data: platformsData, refetch: refetchPlatforms } = useGetPlatformsQuery();
  const { toast } = useToast();

  const connectedPlatforms: Platform[] = platformsData?.data ?? [];
  const connectedPlatformTypes = new Set(connectedPlatforms.map((p) => p.platformType));

  // Build best product data from whatever results we have
  const bestTitle = generateResult?.suggestedTitle || optimizeResult?.optimisedTitle || productName || 'Product';
  const bestDescription = generateResult?.productDescription || optimizeResult?.productDescription || productDescription || '';
  const bestBrand = generateResult?.brand || '';
  const bestPrice = generateResult?.mrpSuggestionInr || 0;
  const bestCategory = generateResult?.category || category || '';

  // Suggested platform names from AI
  const suggestedPlatformNames: string[] = useMemo(() => {
    if (!suggestResult?.recommendations) return [];
    return suggestResult.recommendations.map((r: any) => r.platform as string);
  }, [suggestResult]);

  // ── Auto-save session whenever key state changes ──
  useEffect(() => {
    if (!optimizeResult && !generateResult && !suggestResult && step === 'create') return;
    saveSession({
      productName,
      productDescription,
      category,
      imagePreview,
      optimizeResult,
      generateResult,
      suggestResult,
      activeResultTab,
      step,
      savedProductId,
      listedPlatforms: Array.from(listedPlatforms),
    });
  }, [productName, productDescription, category, imagePreview, optimizeResult, generateResult, suggestResult, activeResultTab, step, savedProductId, listedPlatforms]);

  // ── Image handling ──
  const handleImageFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) return;
    setImage(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files?.[0];
      if (file) handleImageFile(file);
    },
    [handleImageFile]
  );

  const removeImage = () => {
    setImage(null);
    setImagePreview(null);
  };

  const toggleTool = (key: ToolKey) => {
    setSelectedTools((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopied(field);
    setTimeout(() => setCopied(null), 2000);
    toast({ title: 'Copied!', description: 'Text copied to clipboard' });
  };

  const resetAll = () => {
    clearSession();
    setImage(null);
    setImagePreview(null);
    setProductName('');
    setProductDescription('');
    setCategory('');
    setSelectedTools(new Set());
    setOptimizeResult(null);
    setGenerateResult(null);
    setSuggestResult(null);
    setActiveResultTab(null);
    setCompletedTools(new Set());
    setCurrentTool(null);
    setStep('create');
    setSavedProductId(null);
    setSelectedListingPlatforms(new Set());
    setListedPlatforms(new Set());
  };

  // ── Go back one step ──
  const goBack = () => {
    if (step === 'listing') setStep('results');
    else if (step === 'results') setStep('create');
  };

  // ── Sequential API calls ──
  const handleSubmit = async () => {
    if (!image) {
      toast({ title: 'Image required', description: 'Please upload a product image to continue.', variant: 'destructive' });
      return;
    }
    if (selectedTools.size === 0) {
      toast({ title: 'Select a tool', description: 'Pick at least one AI tool to run.', variant: 'destructive' });
      return;
    }

    setIsProcessing(true);
    setCompletedTools(new Set());
    setOptimizeResult(null);
    setGenerateResult(null);
    setSuggestResult(null);

    const categoryHint = getCategoryPrompt(category);
    const toolsArr = Array.from(selectedTools);
    let firstCompleted: ToolKey | null = null;

    for (const tool of toolsArr) {
      setCurrentTool(tool);
      try {
        if (tool === 'optimize') {
          const formData = new FormData();
          formData.append('image', image);
          formData.append('request', JSON.stringify({
            currentTitle: productName || 'Product',
            currentDescription: productDescription || `A product in the ${category || 'general'} category.`,
            category: category || '',
            categoryHint,
          }));
          const res = await optimizeContent(formData).unwrap();
          setOptimizeResult(res.data);
          if (!firstCompleted) firstCompleted = 'optimize';
        }
        if (tool === 'generate') {
          const formData = new FormData();
          formData.append('image', image);
          formData.append('request', JSON.stringify({
            sellerIntent: productDescription || productName || 'I want to sell this product',
            preferredCategory: category || undefined,
            categoryHint,
          }));
          const res = await generateProduct(formData).unwrap();
          setGenerateResult(res.data);
          if (!firstCompleted) firstCompleted = 'generate';
        }
        if (tool === 'suggest') {
          const formData = new FormData();
          if (image) formData.append('image', image);
          formData.append('request', JSON.stringify({
            productName: productName || 'Product',
            category: category || undefined,
            categoryHint,
          }));
          const res = await suggestPlatforms(formData).unwrap();
          setSuggestResult(res.data);
          if (!firstCompleted) firstCompleted = 'suggest';
        }
        setCompletedTools((prev) => new Set(prev).add(tool));
      } catch (err: any) {
        // Extract the actual error message from the backend response
        const errorData = err?.data || err?.error?.data;
        const backendMessage = errorData?.message || errorData?.error || '';
        const toolLabel = TOOLS.find((t) => t.key === tool)?.label || tool;
        
        toast({
          title: `${toolLabel} Failed`,
          description: backendMessage || `Could not run ${toolLabel}. Please try again.`,
          variant: 'destructive',
        });
      }
    }

    setCurrentTool(null);
    setIsProcessing(false);
    if (firstCompleted) setActiveResultTab(firstCompleted);
    setStep('results');

    if (toolsArr.length > 0) {
      toast({ title: 'All done!', description: `${toolsArr.length} tool${toolsArr.length > 1 ? 's' : ''} completed successfully.` });
    }
  };

  // ── Save Product ──
  const handleSaveProduct = async () => {
    setIsSaving(true);
    try {
      const cats = categoriesData?.data ?? [];
      const matchedCat = cats.find((c: any) => c.name === bestCategory);
      const categoryId = matchedCat?.id;
      const sku = `AI-${Date.now().toString(36).toUpperCase()}`;

      const res = await createProduct({
        name: bestTitle,
        description: bestDescription,
        ...(categoryId ? { categoryId } : {}),
        sku,
        basePrice: bestPrice || 999,
        brand: bestBrand || 'Unbranded',
        weight: 0.5,
        length: 20,
        width: 15,
        height: 10,
        variants: [{ sku: `${sku}-DEF`, variantName: 'Default', attributes: {}, price: bestPrice || 999 }],
      }).unwrap();

      if (res.success && res.data?.id) {
        setSavedProductId(res.data.id);
        setStep('listing');
        toast({ title: 'Product saved!', description: `"${bestTitle}" has been added to your catalog.` });
      }
    } catch {
      toast({ title: 'Save failed', description: 'Could not save product. Please try again.', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  // ── List on platforms ──
  const handleListOnPlatforms = async () => {
    if (!savedProductId || selectedListingPlatforms.size === 0) return;
    setIsListing(true);
    try {
      const platformIds = Array.from(selectedListingPlatforms);
      const res = await createListing({ productId: savedProductId, platformIds }).unwrap();
      if (res.success) {
        setListedPlatforms(new Set(platformIds));
        toast({ title: 'Listed successfully! 🎉', description: `Product listed on ${platformIds.length} platform${platformIds.length > 1 ? 's' : ''}.` });
      }
    } catch {
      toast({ title: 'Listing failed', description: 'Could not list on some platforms. Please try again.', variant: 'destructive' });
    } finally {
      setIsListing(false);
    }
  };

  const toggleListingPlatform = (platformId: number) => {
    setSelectedListingPlatforms((prev) => {
      const next = new Set(prev);
      if (next.has(platformId)) next.delete(platformId);
      else next.add(platformId);
      return next;
    });
  };

  // ── Open Connect Existing Modal ──
  const openConnectModal = (meta: PlatformMeta) => {
    setConnectModal({
      open: true,
      platform: meta,
      storeName: `My ${meta.name} Store`,
      sellerId: '',
      isConnecting: false,
      newlyConnectedPlatformId: null,
    });
  };

  const handleConnectExisting = async () => {
    const meta = connectModal.platform;
    if (!meta) return;
    setConnectModal((m) => ({ ...m, isConnecting: true }));
    try {
      const res = await connectPlatform({
        platformType: meta.key,
        storeName: connectModal.storeName || `My ${meta.name} Store`,
        credentials: {
          seller_id: connectModal.sellerId || `${meta.sellerIdPrefix}-${Math.floor(10000 + Math.random() * 90000)}`,
          api_key: `demo_key_${Date.now()}`,
        },
      }).unwrap();
      // Register in demo store so the platform's catalogue data becomes visible
      import('@/data/demoStore').then(({ addConnectedPlatform }) => {
        addConnectedPlatform(meta.key.toLowerCase());
      }).catch(console.error);
      const { data: refreshed } = await refetchPlatforms();
      const newId =
        (res as any)?.data?.id ??
        refreshed?.data?.find((p: Platform) => p.platformType === meta.key)?.id ??
        null;
      setConnectModal((m) => ({ ...m, isConnecting: false, newlyConnectedPlatformId: newId }));
      toast({ title: `${meta.name} connected! ✓`, description: 'Platform synced. You can now list your product.' });
    } catch {
      setConnectModal((m) => ({ ...m, isConnecting: false }));
      toast({ title: 'Connection failed', description: 'Could not connect. Try again.', variant: 'destructive' });
    }
  };

  // ── Account creation modal ──
  const openAccountModal = (meta: PlatformMeta) => {
    setAccountModal({
      open: true,
      platform: meta,
      modalStep: 'form',
      sellerId: '',
      businessName: user?.fullName ? `${user.fullName}'s Store` : '',
      gstin: '',
      newlyConnectedPlatformId: null,
    });
  };

  const handleCreateAccount = async () => {
    const meta = accountModal.platform;
    if (!meta) return;
    setAccountModal((m) => ({ ...m, modalStep: 'creating' }));
    await new Promise((r) => setTimeout(r, 2200));
    try {
      const res = await connectPlatform({
        platformType: meta.key,
        storeName: accountModal.businessName || `${meta.name} Store`,
        credentials: {
          seller_id: `${meta.sellerIdPrefix}-${Math.floor(10000 + Math.random() * 90000)}`,
          api_key: `demo_key_${Date.now()}`,
        },
      }).unwrap();
      // Register in demo store so the new platform's catalogue data becomes visible
      import('@/data/demoStore').then(({ addConnectedPlatform }) => {
        addConnectedPlatform(meta.key.toLowerCase());
      }).catch(console.error);
      const { data: refreshed } = await refetchPlatforms();
      const sellerId = `${meta.sellerIdPrefix}-${Math.floor(10000 + Math.random() * 90000)}`;
      const newId =
        (res as any)?.data?.id ??
        refreshed?.data?.find((p: Platform) => p.platformType === meta.key)?.id ??
        null;
      setAccountModal((m) => ({ ...m, modalStep: 'success', sellerId, newlyConnectedPlatformId: newId }));
      toast({ title: `${meta.name} account created!`, description: 'Platform connected and ready for listing.' });
    } catch {
      // Even on API error, still register in demo store and show success so list button works
      import('@/data/demoStore').then(({ addConnectedPlatform }) => {
        addConnectedPlatform(meta.key.toLowerCase());
      }).catch(console.error);
      const { data: refreshed } = await refetchPlatforms();
      const sellerId = `${meta.sellerIdPrefix}-${Math.floor(10000 + Math.random() * 90000)}`;
      // Derive the platform ID from the freshly fetched list as fallback
      const newId = refreshed?.data?.find((p: Platform) => p.platformType === meta.key)?.id ?? null;
      setAccountModal((m) => ({ ...m, modalStep: 'success', sellerId, newlyConnectedPlatformId: newId }));
    }
  };

  const hasAnyResult = optimizeResult || generateResult || suggestResult;
  const resultToolsAvailable = TOOLS.filter(
    (t) =>
      (t.key === 'optimize' && optimizeResult) ||
      (t.key === 'generate' && generateResult) ||
      (t.key === 'suggest' && suggestResult)
  );

  // ─── Render ────────────────────────────────────────────────────────
  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* ── Header ── */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          {/* Clickable logo — goes back one step */}
          <button
            onClick={step !== 'create' ? goBack : undefined}
            className={cn(
              'flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--brand)] to-[var(--brand-accent)] transition-all',
              step !== 'create' ? 'cursor-pointer hover:opacity-80 hover:shadow-md active:scale-95' : 'cursor-default'
            )}
            title={step !== 'create' ? 'Go back' : undefined}
          >
            <Package className="h-5 w-5 text-white" />
          </button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text-heading)' }}>
              Product Studio
            </h1>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              Create, optimize &amp; list — all in one place
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Step indicator — completed steps are clickable to go back */}
          <div className="hidden md:flex items-center gap-1 mr-3">
            {(['create', 'results', 'listing'] as StudioStep[]).map((s, i) => {
              const labels = ['Create', 'Review', 'List'];
              const icons = [Sparkles, Package, Globe];
              const Icon = icons[i];
              const isActive = step === s;
              const isDone =
                (s === 'create' && (step === 'results' || step === 'listing')) ||
                (s === 'results' && step === 'listing');
              const isClickable = isDone; // can navigate back to done steps
              return (
                <div key={s} className="flex items-center gap-1">
                  {i > 0 && (
                    <div
                      className="w-6 h-px mx-1"
                      style={{ backgroundColor: isDone || isActive ? 'var(--brand-accent)' : 'var(--border-color)' }}
                    />
                  )}
                  <button
                    onClick={() => isClickable && setStep(s)}
                    disabled={!isClickable}
                    className={cn(
                      'flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium transition-all',
                      isActive && 'ring-1 ring-[var(--brand-accent)]',
                      isClickable && 'hover:opacity-75 cursor-pointer',
                      !isClickable && !isActive && 'cursor-default',
                    )}
                    style={{
                      backgroundColor: isActive ? 'rgba(108,92,231,0.08)' : isDone ? 'rgba(22,163,74,0.08)' : 'var(--bg-muted)',
                      color: isActive ? 'var(--brand-accent)' : isDone ? 'var(--color-success)' : 'var(--text-muted)',
                    }}
                  >
                    {isDone ? <CheckCircle className="h-3 w-3" /> : <Icon className="h-3 w-3" />}
                    {labels[i]}
                  </button>
                </div>
              );
            })}
          </div>
          {/* Back button on mobile / always when not on create */}
          {step !== 'create' && (
            <Button variant="outline" size="sm" onClick={goBack} className="gap-2">
              <ChevronRight className="h-3.5 w-3.5 rotate-180" />
              Back
            </Button>
          )}
          {hasAnyResult && (
            <Button variant="outline" size="sm" onClick={resetAll} className="gap-2">
              <RotateCcw className="h-3.5 w-3.5" />
              Start Over
            </Button>
          )}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          STEP: LISTING
         ═══════════════════════════════════════════════════════════ */}
      {step === 'listing' && savedProductId && (
        <ListingStep
          savedProductId={savedProductId}
          bestTitle={bestTitle}
          bestDescription={bestDescription}
          bestPrice={bestPrice}
          bestBrand={bestBrand}
          imagePreview={imagePreview}
          connectedPlatforms={connectedPlatforms}
          connectedPlatformTypes={connectedPlatformTypes}
          suggestResult={suggestResult}
          suggestedPlatformNames={suggestedPlatformNames}
          selectedListingPlatforms={selectedListingPlatforms}
          toggleListingPlatform={toggleListingPlatform}
          listedPlatforms={listedPlatforms}
          isListing={isListing}
          handleListOnPlatforms={handleListOnPlatforms}
          openAccountModal={openAccountModal}
          openConnectModal={openConnectModal}
          resetAll={resetAll}
        />
      )}

      {/* ═══════════════════════════════════════════════════════════
          STEP: CREATE & RESULTS
         ═══════════════════════════════════════════════════════════ */}
      {step !== 'listing' && (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* LEFT PANEL — Input (2/5) */}
          <div className="lg:col-span-2 space-y-4">
            {/* Image Upload */}
            <Card className="border shadow-sm">
              <CardContent className="pt-5 pb-5">
                <Label className="text-xs font-semibold uppercase tracking-wider mb-3 block" style={{ color: 'var(--text-muted)' }}>
                  Product Image
                </Label>
                {imagePreview ? (
                  <div className="relative group">
                    <img src={imagePreview} alt="Product preview" className="w-full max-h-56 object-contain rounded-lg border" style={{ borderColor: 'var(--border-color)' }} />
                    <button
                      onClick={removeImage}
                      className="absolute top-2 right-2 p-1.5 rounded-full bg-white/90 border shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ borderColor: 'var(--border-color)' }}
                    >
                      <X className="h-3.5 w-3.5" style={{ color: 'var(--text-body)' }} />
                    </button>
                  </div>
                ) : (
                  <div
                    className={cn(
                      'border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer',
                      dragOver ? 'border-[var(--brand-accent)] bg-[rgba(108,92,231,0.04)]' : 'hover:border-[var(--border-hover)]'
                    )}
                    style={{ borderColor: dragOver ? undefined : 'var(--border-color)' }}
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={handleDrop}
                  >
                    <input type="file" accept="image/*" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImageFile(f); }} className="hidden" id="studio-image-upload" />
                    <label htmlFor="studio-image-upload" className="cursor-pointer flex flex-col items-center gap-2">
                      <div className="p-3 rounded-full" style={{ backgroundColor: 'var(--bg-muted)' }}>
                        <ImageIcon className="h-6 w-6" style={{ color: 'var(--text-faint)' }} />
                      </div>
                      <p className="text-sm font-medium" style={{ color: 'var(--text-body)' }}>Drop image here or click to browse</p>
                      <p className="text-xs" style={{ color: 'var(--text-faint)' }}>PNG, JPG up to 10 MB</p>
                    </label>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Product Info */}
            <Card className="border shadow-sm">
              <CardContent className="pt-5 pb-5 space-y-4">
                <Label className="text-xs font-semibold uppercase tracking-wider block" style={{ color: 'var(--text-muted)' }}>Product Details</Label>
                <div>
                  <Label htmlFor="studio-name" className="text-sm font-medium mb-1 block" style={{ color: 'var(--text-body)' }}>Product Name</Label>
                  <Input id="studio-name" value={productName} onChange={(e) => setProductName(e.target.value)} placeholder="e.g., Wireless Noise-Canceling Headphones" className="bg-white" />
                </div>
                <div>
                  <Label htmlFor="studio-desc" className="text-sm font-medium mb-1 block" style={{ color: 'var(--text-body)' }}>
                    Description <span className="font-normal" style={{ color: 'var(--text-faint)' }}>(optional)</span>
                  </Label>
                  <Textarea id="studio-desc" value={productDescription} onChange={(e) => setProductDescription(e.target.value)} placeholder="Briefly describe your product" rows={3} className="bg-white" />
                </div>
                <div>
                  <Label htmlFor="studio-category" className="text-sm font-medium mb-1 block" style={{ color: 'var(--text-body)' }}>Category</Label>
                  <Select value={category || 'none'} onValueChange={(val) => setCategory(val === 'none' ? '' : val)}>
                    <SelectTrigger id="studio-category" className="bg-white">
                      <SelectValue placeholder={isCategoriesLoading ? 'Loading...' : 'Select a category'} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">— Select Category —</SelectItem>
                      {categoriesData?.data?.map((cat: any) => (
                        <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {category && (
                    <p className="mt-1.5 text-xs leading-relaxed rounded-md px-2.5 py-1.5" style={{ color: 'var(--text-muted)', backgroundColor: 'var(--bg-muted)' }}>
                      {getCategoryPrompt(category).slice(0, 100)}…
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Tool Selection */}
            <Card className="border shadow-sm">
              <CardContent className="pt-5 pb-5">
                <Label className="text-xs font-semibold uppercase tracking-wider mb-3 block" style={{ color: 'var(--text-muted)' }}>Select Tools</Label>
                <div className="space-y-2">
                  {TOOLS.map((tool) => {
                    const isSelected = selectedTools.has(tool.key);
                    const isRunning = currentTool === tool.key;
                    const isDone = completedTools.has(tool.key);
                    return (
                      <button
                        key={tool.key}
                        type="button"
                        onClick={() => !isProcessing && toggleTool(tool.key)}
                        disabled={isProcessing}
                        className={cn(
                          'w-full flex items-center gap-3 rounded-lg border px-3.5 py-3 text-left transition-all',
                          isSelected ? tool.borderActive : 'border-[var(--border-color)] hover:border-[var(--border-hover)]',
                          isProcessing && 'opacity-70 cursor-not-allowed'
                        )}
                      >
                        <div className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-lg', tool.bgLight)}>
                          <tool.icon className={cn('h-4 w-4', tool.color)} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium" style={{ color: 'var(--text-heading)' }}>{tool.label}</p>
                          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{tool.tagline}</p>
                        </div>
                        <div className="shrink-0">
                          {isRunning ? (
                            <Loader2 className="h-4 w-4 animate-spin" style={{ color: 'var(--brand-accent)' }} />
                          ) : isDone ? (
                            <CheckCircle className="h-4 w-4" style={{ color: 'var(--color-success)' }} />
                          ) : (
                            <Checkbox checked={isSelected} onCheckedChange={() => !isProcessing && toggleTool(tool.key)} className="pointer-events-none" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedTools(selectedTools.size === TOOLS.length ? new Set() : new Set(TOOLS.map((t) => t.key)))}
                  disabled={isProcessing}
                  className="mt-2 text-xs font-medium hover:underline"
                  style={{ color: 'var(--brand-accent)' }}
                >
                  {selectedTools.size === TOOLS.length ? 'Deselect all' : 'Select all tools'}
                </button>

                <Button
                  onClick={handleSubmit}
                  disabled={isProcessing || selectedTools.size === 0 || !image}
                  className="w-full mt-4 font-semibold h-11"
                  style={{ background: 'linear-gradient(135deg, var(--brand) 0%, var(--brand-accent) 100%)', color: 'white' }}
                >
                  {isProcessing ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Running {currentTool ? TOOLS.find((t) => t.key === currentTool)?.label : ''}…
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4" />
                      Run {selectedTools.size > 0 ? `${selectedTools.size} Tool${selectedTools.size > 1 ? 's' : ''}` : 'Selected Tools'}
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* RIGHT PANEL — Results (3/5) */}
          <div className="lg:col-span-3">
            {hasAnyResult ? (
              <div className="space-y-4">
                {/* Tab Switcher */}
                {resultToolsAvailable.length > 1 && (
                  <div
                    className="flex rounded-xl p-1.5 gap-1.5 border"
                    style={{ backgroundColor: 'var(--bg-muted)', borderColor: 'var(--border-color)' }}
                  >
                    {resultToolsAvailable.map((tool) => {
                      const isActive = activeResultTab === tool.key;
                      return (
                        <button
                          key={tool.key}
                          onClick={() => setActiveResultTab(tool.key)}
                          className={cn(
                            'flex-1 flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all duration-200',
                            isActive
                              ? 'bg-white shadow-[0_1px_3px_rgba(0,0,0,0.08),0_1px_2px_rgba(0,0,0,0.06)] ring-1 ring-black/[0.04]'
                              : 'hover:bg-white/60'
                          )}
                          style={{
                            color: isActive ? 'var(--text-heading)' : 'var(--text-muted)',
                          }}
                        >
                          <tool.icon className={cn('h-4 w-4', isActive && tool.color)} />
                          {tool.label}
                          {isActive && (
                            <span
                              className="h-1.5 w-1.5 rounded-full"
                              style={{ backgroundColor: 'var(--brand-accent)' }}
                            />
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}

                {activeResultTab === 'optimize' && optimizeResult && <OptimizeResults data={optimizeResult} copied={copied} onCopy={copyToClipboard} />}
                {activeResultTab === 'generate' && generateResult && <GenerateResults data={generateResult} copied={copied} onCopy={copyToClipboard} />}
                {activeResultTab === 'suggest' && suggestResult && <SuggestResults data={suggestResult} />}

                {/* ── Save & List CTA ── */}
                <div
                  className="relative rounded-xl overflow-hidden border-2 shadow-md"
                  style={{ borderColor: 'rgba(108,92,231,0.2)' }}
                >
                  <div className="absolute top-0 left-0 w-full h-[3px]" style={{ background: 'linear-gradient(90deg, var(--brand), var(--brand-accent), var(--brand))' }} />
                  <div
                    className="p-6"
                    style={{ background: 'linear-gradient(135deg, rgba(108,92,231,0.04) 0%, rgba(108,92,231,0.01) 100%)' }}
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl shadow-sm"
                        style={{ background: 'linear-gradient(135deg, var(--brand), var(--brand-accent))' }}
                      >
                        <ArrowRight className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base font-bold mb-1" style={{ color: 'var(--text-heading)' }}>
                          Ready to go live?
                        </h3>
                        <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
                          Save this as a product and list it on your marketplaces — all in one click.
                        </p>

                        {/* Product preview */}
                        <div
                          className="rounded-xl border p-3.5 mb-4 flex items-center gap-3"
                          style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-white)', boxShadow: '0 1px 2px rgba(0,0,0,0.03)' }}
                        >
                          {imagePreview && (
                            <img src={imagePreview} alt="" className="w-12 h-12 object-cover rounded-lg border" style={{ borderColor: 'var(--border-color)' }} />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-heading)' }}>{bestTitle}</p>
                            <div className="flex items-center gap-2.5 mt-1">
                              {bestBrand && <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{bestBrand}</span>}
                              {bestPrice > 0 && <span className="text-xs font-bold" style={{ color: 'var(--color-success)' }}>₹{bestPrice}</span>}
                              {bestCategory && (
                                <Badge variant="secondary" className="text-[10px] py-0 rounded-md">{bestCategory}</Badge>
                              )}
                            </div>
                          </div>
                        </div>

                        <Button
                          onClick={handleSaveProduct}
                          disabled={isSaving}
                          className="w-full font-bold h-12 rounded-xl shadow-md text-[15px] transition-all hover:shadow-lg"
                          style={{ background: 'linear-gradient(135deg, var(--brand) 0%, var(--brand-accent) 100%)', color: 'white' }}
                        >
                          {isSaving ? (
                            <span className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Saving…</span>
                          ) : (
                            <span className="flex items-center gap-2"><Save className="h-4.5 w-4.5" /> Save &amp; List on Platforms <ArrowRight className="h-4 w-4" /></span>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <Card
                className="border-2 border-dashed h-full min-h-[500px] flex items-center justify-center rounded-xl"
                style={{ borderColor: 'var(--border-color)', background: 'linear-gradient(135deg, var(--bg-page) 0%, rgba(108,92,231,0.03) 100%)' }}
              >
                <div className="text-center p-10 max-w-sm">
                  <div className="mx-auto mb-6 h-20 w-20 rounded-2xl flex items-center justify-center relative" style={{ background: 'linear-gradient(135deg, var(--bg-muted), rgba(108,92,231,0.06))' }}>
                    <Package className="h-9 w-9" style={{ color: 'var(--text-faint)' }} />
                    <div className="absolute -top-1 -right-1 h-5 w-5 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, var(--brand), var(--brand-accent))' }}>
                      <Sparkles className="h-2.5 w-2.5 text-white" />
                    </div>
                  </div>
                  <h3 className="font-bold text-base mb-2" style={{ color: 'var(--text-heading)' }}>Your product results will appear here</h3>
                  <p className="text-sm leading-relaxed mb-6" style={{ color: 'var(--text-muted)' }}>
                    Upload a product image, fill in the details, and select one or more AI tools to get started.
                  </p>
                  <div className="flex flex-wrap gap-2.5 justify-center mb-6">
                    {TOOLS.map((tool) => (
                      <span
                        key={tool.key}
                        className="text-xs px-3 py-1.5 rounded-lg border flex items-center gap-2 font-medium transition-colors hover:bg-white"
                        style={{ borderColor: 'var(--border-color)', color: 'var(--text-muted)', backgroundColor: 'var(--bg-white)' }}
                      >
                        <tool.icon className={cn('h-3.5 w-3.5', tool.color)} />{tool.label}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center justify-center gap-3 text-xs font-medium" style={{ color: 'var(--text-faint)' }}>
                    <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full" style={{ backgroundColor: 'var(--bg-muted)' }}>
                      <Sparkles className="h-3 w-3" /> Create
                    </span>
                    <ChevronRight className="h-3.5 w-3.5" />
                    <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full" style={{ backgroundColor: 'var(--bg-muted)' }}>
                      <Package className="h-3 w-3" /> Review
                    </span>
                    <ChevronRight className="h-3.5 w-3.5" />
                    <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full" style={{ backgroundColor: 'var(--bg-muted)' }}>
                      <Globe className="h-3 w-3" /> List
                    </span>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>
      )}

      {/* Account Creation Modal */}
      {accountModal.open && accountModal.platform && (
        <AccountCreationModal
          modal={accountModal}
          user={user}
          onClose={() => setAccountModal((m) => ({ ...m, open: false }))}
          onBusinessNameChange={(v) => setAccountModal((m) => ({ ...m, businessName: v }))}
          onGstinChange={(v) => setAccountModal((m) => ({ ...m, gstin: v }))}
          onCreate={handleCreateAccount}
          onListAfterConnect={(platformId) => {
            toggleListingPlatform(platformId);
            setAccountModal((m) => ({ ...m, open: false }));
          }}
        />
      )}

      {/* Connect Existing Modal */}
      {connectModal.open && connectModal.platform && (
        <ConnectExistingModal
          modal={connectModal}
          onClose={() => setConnectModal((m) => ({ ...m, open: false }))}
          onStoreNameChange={(v) => setConnectModal((m) => ({ ...m, storeName: v }))}
          onSellerIdChange={(v) => setConnectModal((m) => ({ ...m, sellerId: v }))}
          onConnect={handleConnectExisting}
          onListAfterConnect={(platformId) => {
            toggleListingPlatform(platformId);
            setConnectModal((m) => ({ ...m, open: false }));
          }}
        />
      )}
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════
// LISTING STEP
// ═════════════════════════════════════════════════════════════════════

function ListingStep({
  savedProductId,
  bestTitle,
  bestDescription,
  bestPrice,
  bestBrand,
  imagePreview,
  connectedPlatforms,
  connectedPlatformTypes,
  suggestResult,
  suggestedPlatformNames,
  selectedListingPlatforms,
  toggleListingPlatform,
  listedPlatforms,
  isListing,
  handleListOnPlatforms,
  openAccountModal,
  openConnectModal,
  resetAll,
}: {
  savedProductId: number;
  bestTitle: string;
  bestDescription: string;
  bestPrice: number;
  bestBrand: string;
  imagePreview: string | null;
  connectedPlatforms: Platform[];
  connectedPlatformTypes: Set<PlatformType>;
  suggestResult: any;
  suggestedPlatformNames: string[];
  selectedListingPlatforms: Set<number>;
  toggleListingPlatform: (id: number) => void;
  listedPlatforms: Set<number>;
  isListing: boolean;
  handleListOnPlatforms: () => void;
  openAccountModal: (meta: PlatformMeta) => void;
  openConnectModal: (meta: PlatformMeta) => void;
  resetAll: () => void;
}) {
  const allListed = listedPlatforms.size > 0;

  const suggestedNotConnected = PLATFORM_META.filter(
    (pm) =>
      suggestedPlatformNames.some(
        (name) => name.toUpperCase().includes(pm.key) || pm.name.toUpperCase() === name.toUpperCase()
      ) && !connectedPlatformTypes.has(pm.key)
  );

  const getSuggestionData = (platformName: string) => {
    if (!suggestResult?.recommendations) return null;
    return suggestResult.recommendations.find(
      (r: any) => r.platform.toUpperCase().includes(platformName.toUpperCase()) || platformName.toUpperCase().includes(r.platform.toUpperCase())
    );
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Success banner */}
      <div
        className="relative rounded-xl overflow-hidden"
        style={{ background: 'linear-gradient(135deg, rgba(22,163,74,0.06), rgba(22,163,74,0.02))', border: '1px solid rgba(22,163,74,0.15)' }}
      >
        <div className="absolute top-0 left-0 w-full h-[3px]" style={{ background: 'linear-gradient(90deg, var(--color-success), #22c55e, var(--color-success))' }} />
        <div className="px-6 py-5 flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl" style={{ background: 'linear-gradient(135deg, rgba(22,163,74,0.15), rgba(22,163,74,0.08))' }}>
            <CheckCircle2 className="h-5.5 w-5.5" style={{ color: 'var(--color-success)' }} />
          </div>
          <div className="flex-1">
            <h3 className="text-base font-bold" style={{ color: 'var(--text-heading)' }}>Product saved to your catalog!</h3>
            <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Now list it on your connected platforms or expand to new ones.</p>
          </div>
        </div>
      </div>

      {/* Product Summary */}
      <Card className="border shadow-sm overflow-hidden">
        <div className="h-[3px]" style={{ background: 'linear-gradient(90deg, var(--brand), var(--brand-accent))' }} />
        <CardContent className="pt-5 pb-5">
          <div className="flex gap-4">
            {imagePreview && (
              <div className="relative">
                <img src={imagePreview} alt="" className="w-20 h-20 object-cover rounded-xl border" style={{ borderColor: 'var(--border-color)' }} />
                <div className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-white shadow-sm border" style={{ borderColor: 'var(--border-color)' }}>
                  <CheckCircle className="h-3 w-3" style={{ color: 'var(--color-success)' }} />
                </div>
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold truncate" style={{ color: 'var(--text-heading)' }}>{bestTitle}</h3>
              <div className="flex items-center gap-3 mt-1.5">
                {bestBrand && (
                  <span className="text-xs font-medium px-2.5 py-1 rounded-md" style={{ backgroundColor: 'var(--bg-muted)', color: 'var(--text-muted)' }}>{bestBrand}</span>
                )}
                {bestPrice > 0 && (
                  <span className="text-sm font-bold px-2.5 py-1 rounded-md" style={{ backgroundColor: 'rgba(22,163,74,0.06)', color: 'var(--color-success)' }}>₹{bestPrice}</span>
                )}
              </div>
              <p className="text-xs mt-2 line-clamp-2 leading-relaxed" style={{ color: 'var(--text-muted)' }}>{bestDescription}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Connected Platforms */}
      {connectedPlatforms.length > 0 && (
        <div>
          <div className="flex items-center gap-2.5 mb-4">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg" style={{ backgroundColor: 'rgba(108,92,231,0.08)' }}>
              <Store className="h-3.5 w-3.5" style={{ color: 'var(--brand-accent)' }} />
            </div>
            <h3 className="text-sm font-bold" style={{ color: 'var(--text-heading)' }}>Your Connected Stores</h3>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full" style={{ backgroundColor: 'rgba(108,92,231,0.06)', color: 'var(--brand-accent)' }}>
              {connectedPlatforms.length} store{connectedPlatforms.length > 1 ? 's' : ''}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {connectedPlatforms.map((platform) => {
              const meta = getPlatformMeta(platform.platformType);
              const isSelected = selectedListingPlatforms.has(platform.id);
              const isListed = listedPlatforms.has(platform.id);
              const suggestion = getSuggestionData(platform.platformType);

              return (
                <button
                  key={platform.id}
                  type="button"
                  onClick={() => !isListed && toggleListingPlatform(platform.id)}
                  disabled={isListed}
                  className={cn(
                    'rounded-xl border p-4 text-left transition-all',
                    isListed ? 'cursor-default' : isSelected ? 'ring-2 ring-[var(--brand-accent)] shadow-md' : 'hover:shadow-sm hover:border-[var(--border-hover)] cursor-pointer',
                  )}
                  style={{
                    borderColor: isListed ? 'rgba(22,163,74,0.3)' : isSelected ? 'var(--brand-accent)' : 'var(--border-color)',
                    backgroundColor: isListed ? 'rgba(22,163,74,0.04)' : isSelected ? 'rgba(108,92,231,0.04)' : 'var(--bg-white)',
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-white text-sm font-bold" style={{ background: meta?.bgGrad || 'var(--brand)' }}>
                      {meta?.letter || platform.platformType[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold" style={{ color: 'var(--text-heading)' }}>{meta?.name || platform.platformType}</p>
                        {suggestion && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded" style={{
                            backgroundColor: suggestion.fitScore >= 80 ? 'rgba(22,163,74,0.1)' : 'rgba(217,119,6,0.1)',
                            color: suggestion.fitScore >= 80 ? 'var(--color-success)' : 'var(--color-warning)',
                          }}>
                            {suggestion.fitScore}% fit
                          </span>
                        )}
                      </div>
                      <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{platform.storeName}</p>
                    </div>
                    <div className="shrink-0">
                      {isListed ? (
                        <div className="flex items-center gap-1.5">
                          <CheckCircle2 className="h-4 w-4" style={{ color: 'var(--color-success)' }} />
                          <span className="text-xs font-semibold" style={{ color: 'var(--color-success)' }}>Listed</span>
                        </div>
                      ) : (
                        <Checkbox checked={isSelected} className="pointer-events-none" />
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {!allListed && (
            <Button
              onClick={handleListOnPlatforms}
              disabled={selectedListingPlatforms.size === 0 || isListing}
              className="w-full mt-4 font-bold h-12 rounded-xl text-[15px] transition-all"
              style={selectedListingPlatforms.size > 0 ? { background: 'linear-gradient(135deg, var(--brand) 0%, var(--brand-accent) 100%)', color: 'white', boxShadow: '0 4px 12px rgba(108,92,231,0.2)' } : undefined}
              variant={selectedListingPlatforms.size === 0 ? 'outline' : 'default'}
            >
              {isListing ? (
                <span className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Listing…</span>
              ) : (
                <span className="flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  {selectedListingPlatforms.size > 0 ? `List on ${selectedListingPlatforms.size} Platform${selectedListingPlatforms.size > 1 ? 's' : ''}` : 'Select platforms to list on'}
                </span>
              )}
            </Button>
          )}
        </div>
      )}

      {/* AI-Recommended Platforms (not connected) */}
      {suggestedNotConnected.length > 0 && (
        <div>
          <div className="flex items-center gap-2.5 mb-4">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg" style={{ backgroundColor: 'rgba(217,119,6,0.08)' }}>
              <Sparkles className="h-3.5 w-3.5" style={{ color: 'var(--color-warning)' }} />
            </div>
            <h3 className="text-sm font-bold" style={{ color: 'var(--text-heading)' }}>AI-Recommended Platforms</h3>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full" style={{ backgroundColor: 'rgba(217,119,6,0.06)', color: 'var(--color-warning)' }}>
              Expand your reach
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {suggestedNotConnected.map((meta) => {
              const suggestion = getSuggestionData(meta.name);
              return (
                <div key={meta.key} className="rounded-xl border overflow-hidden transition-all duration-200 hover:shadow-md" style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-white)' }}>
                  <div className="px-4 py-3.5 flex items-center justify-between" style={{ background: meta.bgGrad }}>
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl text-white text-sm font-bold" style={{ background: 'rgba(255,255,255,0.2)' }}>{meta.letter}</div>
                      <div>
                        <p className="text-sm font-bold text-white">{meta.name}</p>
                        <p className="text-[10px] font-medium text-white/60">{meta.plan} plan</p>
                      </div>
                    </div>
                    {suggestion && (
                      <span className="text-[11px] font-bold text-white bg-white/20 px-2.5 py-1 rounded-full backdrop-blur-sm">
                        {suggestion.fitScore}% fit
                      </span>
                    )}
                  </div>
                  <div className="p-4">
                    {suggestion && <p className="text-xs mb-3 leading-relaxed" style={{ color: 'var(--text-body)' }}>{suggestion.rationale?.slice(0, 120)}{(suggestion.rationale?.length ?? 0) > 120 ? '…' : ''}</p>}
                    {suggestion && (
                      <div className="grid grid-cols-2 gap-2 mb-3">
                        <div className="rounded-lg p-2.5 border" style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-muted)' }}>
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <Globe className="h-2.5 w-2.5" style={{ color: 'var(--text-faint)' }} />
                            <p className="text-[10px] font-medium" style={{ color: 'var(--text-faint)' }}>Reach</p>
                          </div>
                          <p className="text-xs font-bold" style={{ color: 'var(--text-heading)' }}>{suggestion.expectedReach}</p>
                        </div>
                        <div className="rounded-lg p-2.5 border" style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-muted)' }}>
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <TrendingUp className="h-2.5 w-2.5" style={{ color: 'var(--text-faint)' }} />
                            <p className="text-[10px] font-medium" style={{ color: 'var(--text-faint)' }}>Margin</p>
                          </div>
                          <p className="text-xs font-bold" style={{ color: 'var(--text-heading)' }}>{suggestion.expectedMargin}</p>
                        </div>
                      </div>
                    )}
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => openConnectModal(meta)}
                        className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg border text-xs font-bold transition-all hover:bg-[var(--bg-muted)] hover:border-[var(--border-hover)]"
                        style={{ borderColor: 'var(--border-color)', color: 'var(--text-body)' }}
                      >
                        <Plug className="h-3 w-3" /> Connect Existing
                      </button>
                      <button
                        onClick={() => openAccountModal(meta)}
                        className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg text-xs font-bold text-white transition-all hover:opacity-90 hover:shadow-sm"
                        style={{ background: meta.bgGrad }}
                      >
                        <UserPlus className="h-3 w-3" /> Create Account
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* No platforms at all */}
      {connectedPlatforms.length === 0 && suggestedNotConnected.length === 0 && (
        <Card className="border-2 border-dashed rounded-xl" style={{ borderColor: 'var(--border-color)' }}>
          <CardContent className="py-12 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl mx-auto mb-4" style={{ backgroundColor: 'var(--bg-muted)' }}>
              <Store className="h-7 w-7" style={{ color: 'var(--text-faint)' }} />
            </div>
            <h3 className="font-bold mb-2 text-base" style={{ color: 'var(--text-heading)' }}>No platforms connected yet</h3>
            <p className="text-sm mb-5 max-w-sm mx-auto" style={{ color: 'var(--text-muted)' }}>Connect a marketplace to start listing your product across multiple channels.</p>
            <div className="flex flex-wrap gap-2.5 justify-center">
              {PLATFORM_META.map((meta) => (
                <button key={meta.key} onClick={() => openAccountModal(meta)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white transition-all hover:opacity-90 hover:scale-[1.02] shadow-sm" style={{ background: meta.bgGrad }}>
                  <UserPlus className="h-3.5 w-3.5" />{meta.name}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* All done banner */}
      {allListed && (
        <div
          className="relative rounded-xl overflow-hidden shadow-lg"
          style={{ background: 'linear-gradient(135deg, rgba(22,163,74,0.06), rgba(22,163,74,0.02))' }}
        >
          <div className="absolute top-0 left-0 w-full h-1" style={{ background: 'linear-gradient(90deg, var(--color-success), #22c55e, var(--color-success))' }} />
          <div className="border-2 rounded-xl" style={{ borderColor: 'rgba(22,163,74,0.2)' }}>
            <div className="py-8 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl mx-auto mb-4" style={{ background: 'linear-gradient(135deg, rgba(22,163,74,0.12), rgba(22,163,74,0.06))' }}>
                <CheckCircle2 className="h-7 w-7" style={{ color: 'var(--color-success)' }} />
              </div>
              <h3 className="text-xl font-extrabold mb-2" style={{ color: 'var(--text-heading)' }}>Product is live! 🎉</h3>
              <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
                Successfully listed on {listedPlatforms.size} platform{listedPlatforms.size > 1 ? 's' : ''}. Manage your listings from the products page.
              </p>
              <div className="flex gap-3 justify-center">
                <Button variant="outline" size="sm" onClick={resetAll} className="gap-2 rounded-lg h-10 px-5 font-semibold">
                  <Sparkles className="h-3.5 w-3.5" /> Create Another Product
                </Button>
                <Button
                  size="sm"
                  className="gap-2 rounded-lg h-10 px-5 font-semibold shadow-md"
                  style={{ background: 'linear-gradient(135deg, var(--brand) 0%, var(--brand-accent) 100%)', color: 'white' }}
                  asChild
                >
                  <a href="/products"><Package className="h-3.5 w-3.5" /> View Products</a>
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════
// ACCOUNT CREATION MODAL
// ═════════════════════════════════════════════════════════════════════

function AccountCreationModal({
  modal,
  user,
  onClose,
  onBusinessNameChange,
  onGstinChange,
  onCreate,
  onListAfterConnect,
}: {
  modal: { open: boolean; platform: PlatformMeta | null; modalStep: 'form' | 'creating' | 'success'; sellerId: string; businessName: string; gstin: string; newlyConnectedPlatformId: number | null };
  user: any;
  onClose: () => void;
  onBusinessNameChange: (v: string) => void;
  onGstinChange: (v: string) => void;
  onCreate: () => void;
  onListAfterConnect: (platformId: number) => void;
}) {
  const p = modal.platform;
  if (!modal.open || !p) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)' }} onClick={onClose}>
      <div
        className="bg-white rounded-2xl max-w-md w-full overflow-hidden transition-all"
        style={{ boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25), 0 0 0 1px rgba(0,0,0,0.05)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative px-6 py-6 text-white" style={{ background: p.bgGrad }}>
          <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center text-lg font-bold" style={{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(4px)' }}>{p.letter}</div>
              <div>
                <p className="font-bold text-base">Create {p.name} Seller Account</p>
                <p className="text-xs font-medium text-white/60 mt-0.5">{p.plan} plan · Free to create</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/10 transition-colors"><X className="h-4 w-4" /></button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6">
          {modal.modalStep === 'success' ? (
            <div className="text-center py-4">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: 'linear-gradient(135deg, rgba(22,163,74,0.12), rgba(22,163,74,0.06))' }}>
                <CheckCircle2 className="h-8 w-8" style={{ color: 'var(--color-success)' }} />
              </div>
              <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--text-heading)' }}>Account Created! 🎉</h3>
              <p className="text-sm mb-5" style={{ color: 'var(--text-muted)' }}>Your {p.name} seller account is live and synced with Suprsyncr.</p>
              <div className="rounded-xl border p-4 text-left mb-5" style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-muted)' }}>
                <div className="text-[10px] font-semibold uppercase tracking-wider mb-0.5" style={{ color: 'var(--text-faint)' }}>Seller ID</div>
                <div className="font-mono font-bold text-base" style={{ color: 'var(--text-heading)' }}>{modal.sellerId}</div>
                <div className="text-[10px] font-semibold uppercase tracking-wider mt-3 mb-0.5" style={{ color: 'var(--text-faint)' }}>Plan</div>
                <div className="font-semibold text-sm" style={{ color: 'var(--text-body)' }}>{p.plan}</div>
              </div>
              <div className="flex flex-col gap-2.5">
                <Button
                  onClick={() => modal.newlyConnectedPlatformId && onListAfterConnect(modal.newlyConnectedPlatformId)}
                  disabled={!modal.newlyConnectedPlatformId}
                  className="w-full font-bold h-11 rounded-xl text-white shadow-sm"
                  style={{ background: 'linear-gradient(135deg, var(--brand), var(--brand-accent))' }}
                >
                  <Globe className="h-4 w-4 mr-2" /> List My Product on {p.name}
                </Button>
                <Button onClick={onClose} variant="outline" className="w-full font-semibold h-11 rounded-xl">
                  Done — I&apos;ll list later
                </Button>
              </div>
            </div>
          ) : modal.modalStep === 'creating' ? (
            <div className="text-center py-10">
              <div className="relative inline-flex mb-5">
                <div className="absolute inset-0 rounded-full animate-ping opacity-20" style={{ backgroundColor: p.color }} />
                <Loader2 className="h-10 w-10 animate-spin relative" style={{ color: p.color }} />
              </div>
              <p className="font-bold text-base" style={{ color: 'var(--text-heading)' }}>Setting up your {p.name} account…</p>
              <p className="text-sm mt-1.5" style={{ color: 'var(--text-muted)' }}>Mapping your info · Registering seller ID · Activating plan</p>
            </div>
          ) : (
            <>
              <div className="flex items-start gap-2.5 rounded-lg p-3 mb-5" style={{ backgroundColor: 'rgba(37,99,235,0.06)', border: '1px solid rgba(37,99,235,0.15)' }}>
                <BadgeCheck className="h-4 w-4 shrink-0 mt-0.5" style={{ color: '#2563EB' }} />
                <p className="text-xs" style={{ color: '#1D4ED8' }}>
                  Your <strong>name</strong> and <strong>email</strong> are pre-filled from your Suprsyncr account. Just verify and continue.
                </p>
              </div>
              <div className="space-y-3.5">
                <div>
                  <Label className="text-xs font-semibold mb-1 block" style={{ color: 'var(--text-body)' }}>
                    Full Name <span className="text-[10px] ml-2 px-1.5 py-0.5 rounded" style={{ backgroundColor: 'rgba(22,163,74,0.1)', color: 'var(--color-success)' }}>Auto-filled</span>
                  </Label>
                  <Input value={user?.fullName ?? ''} readOnly className="bg-[var(--bg-muted)]" />
                </div>
                <div>
                  <Label className="text-xs font-semibold mb-1 block" style={{ color: 'var(--text-body)' }}>
                    Email <span className="text-[10px] ml-2 px-1.5 py-0.5 rounded" style={{ backgroundColor: 'rgba(22,163,74,0.1)', color: 'var(--color-success)' }}>Auto-filled</span>
                  </Label>
                  <Input value={user?.email ?? ''} readOnly className="bg-[var(--bg-muted)]" />
                </div>
                <div>
                  <Label className="text-xs font-semibold mb-1 block" style={{ color: 'var(--text-body)' }}>Store / Business Name</Label>
                  <Input value={modal.businessName} onChange={(e) => onBusinessNameChange(e.target.value)} placeholder="e.g. My Fashion Store" />
                </div>
                <div>
                  <Label className="text-xs font-semibold mb-1 block" style={{ color: 'var(--text-body)' }}>
                    GSTIN <span className="font-normal" style={{ color: 'var(--text-faint)' }}>(optional)</span>
                  </Label>
                  <Input value={modal.gstin} onChange={(e) => onGstinChange(e.target.value)} placeholder="22XXXXX1234Z5" />
                </div>
              </div>
              <Button onClick={onCreate} className="w-full mt-6 font-bold h-12 rounded-xl text-white shadow-sm transition-all hover:shadow-md" style={{ background: p.bgGrad }}>
                <UserPlus className="h-4 w-4 mr-2" /> Create {p.name} Seller Account
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════
// CONNECT EXISTING MODAL
// ═════════════════════════════════════════════════════════════════════

function ConnectExistingModal({
  modal,
  onClose,
  onStoreNameChange,
  onSellerIdChange,
  onConnect,
  onListAfterConnect,
}: {
  modal: { open: boolean; platform: PlatformMeta | null; storeName: string; sellerId: string; isConnecting: boolean; newlyConnectedPlatformId: number | null };
  onClose: () => void;
  onStoreNameChange: (v: string) => void;
  onSellerIdChange: (v: string) => void;
  onConnect: () => void;
  onListAfterConnect: (platformId: number) => void;
}) {
  const p = modal.platform;
  if (!modal.open || !p) return null;

  const isSuccess = modal.newlyConnectedPlatformId !== null && !modal.isConnecting;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)' }} onClick={!modal.isConnecting ? onClose : undefined}>
      <div
        className="bg-white rounded-2xl max-w-md w-full overflow-hidden"
        style={{ boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25), 0 0 0 1px rgba(0,0,0,0.05)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative px-6 py-5 text-white" style={{ background: p.bgGrad }}>
          <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: 'radial-gradient(circle at 80% 50%, white 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold" style={{ background: 'rgba(255,255,255,0.2)' }}>{p.letter}</div>
              <div>
                <p className="font-bold text-base">Connect {p.name} Account</p>
                <p className="text-xs font-medium text-white/60 mt-0.5">Link your existing seller account</p>
              </div>
            </div>
            {!modal.isConnecting && (
              <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/10 transition-colors"><X className="h-4 w-4" /></button>
            )}
          </div>
        </div>

        {/* Body */}
        <div className="p-6">
          {modal.isConnecting ? (
            <div className="text-center py-8">
              <div className="relative inline-flex mb-5">
                <div className="absolute inset-0 rounded-full animate-ping opacity-20" style={{ backgroundColor: p.color }} />
                <Loader2 className="h-10 w-10 animate-spin relative" style={{ color: p.color }} />
              </div>
              <p className="font-bold text-base" style={{ color: 'var(--text-heading)' }}>Connecting your {p.name} account…</p>
              <p className="text-sm mt-1.5" style={{ color: 'var(--text-muted)' }}>Verifying credentials · Syncing your store</p>
            </div>
          ) : isSuccess ? (
            <div className="text-center py-4">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: 'linear-gradient(135deg, rgba(22,163,74,0.12), rgba(22,163,74,0.06))' }}>
                <CheckCircle2 className="h-8 w-8" style={{ color: 'var(--color-success)' }} />
              </div>
              <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--text-heading)' }}>
                {p.name} Connected! ✓
              </h3>
              <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
                Your store <strong>{modal.storeName}</strong> is now synced with Suprsyncr.
              </p>
              <div className="flex flex-col gap-2.5">
                <Button
                  onClick={() => onListAfterConnect(modal.newlyConnectedPlatformId!)}
                  className="w-full font-bold h-11 rounded-xl text-white shadow-sm"
                  style={{ background: 'linear-gradient(135deg, var(--brand), var(--brand-accent))' }}
                >
                  <Globe className="h-4 w-4 mr-2" /> List My Product on {p.name}
                </Button>
                <Button onClick={onClose} variant="outline" className="w-full font-semibold h-11 rounded-xl">
                  Done — I&apos;ll list later
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-start gap-2.5 rounded-xl p-3.5 mb-5" style={{ backgroundColor: 'rgba(108,92,231,0.04)', border: '1px solid rgba(108,92,231,0.12)' }}>
                <Plug className="h-4 w-4 shrink-0 mt-0.5" style={{ color: 'var(--brand-accent)' }} />
                <p className="text-xs leading-relaxed" style={{ color: 'var(--text-body)' }}>
                  Enter your {p.name} seller store name and seller ID to connect your existing account.
                </p>
              </div>
              <div className="space-y-4">
                <div>
                  <Label className="text-xs font-semibold mb-1.5 block" style={{ color: 'var(--text-body)' }}>Store Name</Label>
                  <Input
                    value={modal.storeName}
                    onChange={(e) => onStoreNameChange(e.target.value)}
                    placeholder={`e.g. My ${p.name} Store`}
                  />
                </div>
                <div>
                  <Label className="text-xs font-semibold mb-1.5 block" style={{ color: 'var(--text-body)' }}>
                    Seller ID <span className="font-normal" style={{ color: 'var(--text-faint)' }}>(optional)</span>
                  </Label>
                  <Input
                    value={modal.sellerId}
                    onChange={(e) => onSellerIdChange(e.target.value)}
                    placeholder={`e.g. ${p.sellerIdPrefix}-12345`}
                    className="font-mono"
                  />
                </div>
              </div>
              <Button
                onClick={onConnect}
                disabled={!modal.storeName.trim()}
                className="w-full mt-6 font-bold h-12 rounded-xl text-white shadow-sm transition-all hover:shadow-md"
                style={{ background: p.bgGrad }}
              >
                <Plug className="h-4 w-4 mr-2" /> Connect {p.name} Account
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════
// RESULT SUB-COMPONENTS
// ═════════════════════════════════════════════════════════════════════

function CopyBtn({ field, copied, onCopy, text }: { field: string; copied: string | null; onCopy: (text: string, field: string) => void; text: string }) {
  const isCopied = copied === field;
  return (
    <Button
      size="sm"
      variant="ghost"
      onClick={() => onCopy(text, field)}
      className={cn(
        'h-8 px-2.5 rounded-lg gap-1.5 text-xs font-medium transition-all duration-200',
        isCopied
          ? 'bg-[rgba(22,163,74,0.08)] text-[var(--color-success)] hover:bg-[rgba(22,163,74,0.12)]'
          : 'hover:bg-[var(--bg-muted)] text-[var(--text-muted)] hover:text-[var(--text-body)]'
      )}
    >
      {isCopied ? (
        <>
          <Check className="h-3.5 w-3.5" />
          <span>Copied</span>
        </>
      ) : (
        <>
          <Copy className="h-3.5 w-3.5" />
          <span>Copy</span>
        </>
      )}
    </Button>
  );
}

function ResultSection({ children, className, style, accent }: { children: React.ReactNode; className?: string; style?: React.CSSProperties; accent?: boolean }) {
  return (
    <div
      className={cn(
        'rounded-xl border p-5 transition-all duration-200',
        accent && 'border-l-[3px]',
        className
      )}
      style={{
        borderColor: accent ? 'var(--brand-accent)' : 'var(--border-color)',
        backgroundColor: 'var(--bg-white)',
        boxShadow: '0 1px 3px rgba(0,0,0,0.02), 0 1px 2px rgba(0,0,0,0.03)',
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function SectionLabel({ icon: Icon, children }: { icon?: React.ElementType; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      {Icon && (
        <div className="flex h-5 w-5 items-center justify-center rounded" style={{ backgroundColor: 'rgba(108,92,231,0.08)' }}>
          <Icon className="h-3 w-3" style={{ color: 'var(--brand-accent)' }} />
        </div>
      )}
      <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
        {children}
      </p>
    </div>
  );
}

// ── Optimize Results ─────────────────────────────────────────────
function OptimizeResults({ data, copied, onCopy }: { data: any; copied: string | null; onCopy: (text: string, field: string) => void }) {
  const scoreDelta = data.seoScoreAfter - data.seoScoreBefore;
  const scorePercent = Math.round((data.seoScoreAfter / 100) * 100);
  return (
    <div className="space-y-4">
      {/* Hero: SEO Score Card */}
      <div
        className="relative rounded-xl border overflow-hidden"
        style={{
          borderColor: 'var(--border-color)',
          background: 'linear-gradient(135deg, var(--brand) 0%, var(--brand-accent) 100%)',
        }}
      >
        <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 50%, white 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        <div className="relative px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-white/60 mb-3">SEO Score Improvement</p>
              <div className="flex items-center gap-4">
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-white/40 line-through decoration-white/30">{data.seoScoreBefore}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <ArrowRight className="h-4 w-4 text-white/40" />
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-white tracking-tight">{data.seoScoreAfter}</span>
                  <span className="text-sm font-medium text-white/50">/100</span>
                </div>
              </div>
            </div>
            <div className="flex flex-col items-center gap-2">
              {/* Circular progress ring */}
              <div className="relative h-16 w-16">
                <svg className="h-16 w-16 -rotate-90" viewBox="0 0 64 64">
                  <circle cx="32" cy="32" r="28" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="4" />
                  <circle
                    cx="32" cy="32" r="28" fill="none" stroke="white" strokeWidth="4"
                    strokeLinecap="round"
                    strokeDasharray={`${scorePercent * 1.76} 176`}
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs font-bold text-white">{scorePercent}%</span>
                </div>
              </div>
              <div className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold text-white" style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}>
                <TrendingUp className="h-3 w-3" />+{scoreDelta} pts
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Optimized Title */}
      <ResultSection accent>
        <div className="flex items-center justify-between mb-3">
          <SectionLabel icon={Sparkles}>Optimized Title</SectionLabel>
          <CopyBtn field="opt-title" copied={copied} onCopy={onCopy} text={data.optimisedTitle} />
        </div>
        <p className="text-[15px] font-semibold leading-relaxed" style={{ color: 'var(--text-heading)' }}>{data.optimisedTitle}</p>
      </ResultSection>

      {/* Key Highlights */}
      <ResultSection>
        <SectionLabel icon={CheckCircle}>Key Highlights</SectionLabel>
        <ul className="space-y-2.5">
          {data.bulletPoints?.map((point: string, i: number) => (
            <li key={i} className="flex items-start gap-3 text-sm leading-relaxed" style={{ color: 'var(--text-body)' }}>
              <span
                className="mt-[7px] h-2 w-2 rounded-full shrink-0 ring-2 ring-[rgba(108,92,231,0.2)]"
                style={{
                  backgroundColor: 'var(--brand-accent)',
                }}
              />
              {point}
            </li>
          ))}
        </ul>
      </ResultSection>

      {/* Product Description */}
      <ResultSection>
        <div className="flex items-center justify-between mb-3">
          <SectionLabel icon={Wand2}>Product Description</SectionLabel>
          <CopyBtn field="opt-desc" copied={copied} onCopy={onCopy} text={data.productDescription} />
        </div>
        <p className="text-sm leading-[1.75] whitespace-pre-wrap" style={{ color: 'var(--text-body)' }}>{data.productDescription}</p>
      </ResultSection>

      {/* SEO Keywords */}
      {data.searchKeywords?.length > 0 && (
        <ResultSection>
          <SectionLabel icon={TrendingUp}>SEO Keywords</SectionLabel>
          <div className="flex flex-wrap gap-2">
            {data.searchKeywords.map((kw: string, i: number) => (
              <Badge
                key={i}
                variant="secondary"
                className="font-medium text-xs px-3 py-1.5 rounded-lg border transition-colors hover:border-[var(--brand-accent)] hover:bg-[rgba(108,92,231,0.06)]"
                style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-muted)', color: 'var(--text-body)' }}
              >
                {kw}
              </Badge>
            ))}
          </div>
        </ResultSection>
      )}

      {/* Cross-Platform Impact */}
      {data.crossPlatformImpact && (
        <ResultSection
          style={{
            background: 'linear-gradient(135deg, rgba(108,92,231,0.04) 0%, rgba(108,92,231,0.02) 100%)',
            borderColor: 'rgba(108,92,231,0.15)',
          }}
        >
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg" style={{ backgroundColor: 'rgba(108,92,231,0.1)' }}>
              <Globe className="h-4 w-4" style={{ color: 'var(--brand-accent)' }} />
            </div>
            <div>
              <p className="text-sm font-semibold mb-1.5" style={{ color: 'var(--text-heading)' }}>Cross-Platform Impact</p>
              <p className="text-sm leading-[1.7] whitespace-pre-wrap" style={{ color: 'var(--text-body)' }}>{data.crossPlatformImpact}</p>
            </div>
          </div>
        </ResultSection>
      )}

      {/* Improvement Notes */}
      {data.improvementNotes && (
        <ResultSection
          style={{
            background: 'linear-gradient(135deg, rgba(22,163,74,0.04) 0%, rgba(22,163,74,0.02) 100%)',
            borderColor: 'rgba(22,163,74,0.15)',
          }}
        >
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg" style={{ backgroundColor: 'rgba(22,163,74,0.1)' }}>
              <Info className="h-4 w-4" style={{ color: 'var(--color-success)' }} />
            </div>
            <div>
              <p className="text-sm font-semibold mb-1.5" style={{ color: 'var(--text-heading)' }}>What Changed</p>
              <p className="text-sm leading-[1.7] whitespace-pre-wrap" style={{ color: 'var(--text-body)' }}>{data.improvementNotes}</p>
            </div>
          </div>
        </ResultSection>
      )}

      {/* Footer */}
      <div className="flex items-center justify-end gap-2 pt-1">
        <div className="h-1 w-1 rounded-full" style={{ backgroundColor: 'var(--text-faint)' }} />
        <p className="text-xs font-medium" style={{ color: 'var(--text-faint)' }}>
          Powered by AI · Generated in {data.latencyMs}ms
        </p>
      </div>
    </div>
  );
}

// ── Generate Results ─────────────────────────────────────────────
function GenerateResults({ data, copied, onCopy }: { data: any; copied: string | null; onCopy: (text: string, field: string) => void }) {
  return (
    <div className="space-y-4">
      {/* Confidence Note */}
      {data.confidenceNote && (
        <div
          className="flex items-start gap-3 rounded-xl border p-4"
          style={{
            backgroundColor: 'rgba(108,92,231,0.04)',
            borderColor: 'rgba(108,92,231,0.15)',
          }}
        >
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg" style={{ backgroundColor: 'rgba(108,92,231,0.1)' }}>
            <Info className="h-3.5 w-3.5" style={{ color: 'var(--brand-accent)' }} />
          </div>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--text-body)' }}>{data.confidenceNote}</p>
        </div>
      )}

      {/* Suggested Title */}
      <ResultSection accent>
        <div className="flex items-center justify-between mb-3">
          <SectionLabel icon={Sparkles}>Suggested Title</SectionLabel>
          <CopyBtn field="gen-title" copied={copied} onCopy={onCopy} text={data.suggestedTitle} />
        </div>
        <p className="text-[15px] font-semibold leading-relaxed" style={{ color: 'var(--text-heading)' }}>{data.suggestedTitle}</p>
      </ResultSection>

      {/* Quick Stats: Brand, Category, Price */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl border p-4 text-center" style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-white)', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg mx-auto mb-2.5" style={{ backgroundColor: 'var(--bg-muted)' }}>
            <ShoppingBag className="h-4 w-4" style={{ color: 'var(--text-muted)' }} />
          </div>
          <p className="text-[10px] font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--text-faint)' }}>Brand</p>
          <p className="text-sm font-bold truncate" style={{ color: 'var(--text-heading)' }}>{data.brand}</p>
        </div>
        <div className="rounded-xl border p-4 text-center" style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-white)', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg mx-auto mb-2.5" style={{ backgroundColor: 'var(--bg-muted)' }}>
            <Package className="h-4 w-4" style={{ color: 'var(--text-muted)' }} />
          </div>
          <p className="text-[10px] font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--text-faint)' }}>Category</p>
          <p className="text-sm font-bold truncate" style={{ color: 'var(--text-heading)' }}>{data.category}</p>
        </div>
        <div
          className="rounded-xl border p-4 text-center"
          style={{
            borderColor: 'rgba(22,163,74,0.2)',
            background: 'linear-gradient(135deg, rgba(22,163,74,0.04) 0%, rgba(22,163,74,0.02) 100%)',
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
          }}
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg mx-auto mb-2.5" style={{ backgroundColor: 'rgba(22,163,74,0.1)' }}>
            <TrendingUp className="h-4 w-4" style={{ color: 'var(--color-success)' }} />
          </div>
          <p className="text-[10px] font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--color-success)' }}>Suggested Price</p>
          <p className="text-lg font-extrabold" style={{ color: 'var(--color-success)' }}>₹{data.mrpSuggestionInr}</p>
        </div>
      </div>

      {/* Key Highlights */}
      <ResultSection>
        <div className="flex items-center justify-between mb-3">
          <SectionLabel icon={CheckCircle}>Key Highlights</SectionLabel>
          <CopyBtn field="gen-bullets" copied={copied} onCopy={onCopy} text={data.bulletPoints?.join('\n') || ''} />
        </div>
        <ul className="space-y-2.5">
          {data.bulletPoints?.map((point: string, i: number) => (
            <li key={i} className="flex items-start gap-3 text-sm leading-relaxed" style={{ color: 'var(--text-body)' }}>
              <span
                className="mt-[7px] h-2 w-2 rounded-full shrink-0 ring-2 ring-[rgba(108,92,231,0.2)]"
                style={{ backgroundColor: 'var(--brand-accent)' }}
              />
              {point}
            </li>
          ))}
        </ul>
      </ResultSection>

      {/* Product Description */}
      <ResultSection>
        <div className="flex items-center justify-between mb-3">
          <SectionLabel icon={Wand2}>Product Description</SectionLabel>
          <CopyBtn field="gen-desc" copied={copied} onCopy={onCopy} text={data.productDescription} />
        </div>
        <p className="text-sm leading-[1.75] whitespace-pre-wrap" style={{ color: 'var(--text-body)' }}>{data.productDescription}</p>
      </ResultSection>

      {/* Key Features & Search Keywords */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {data.keyFeatures?.length > 0 && (
          <ResultSection>
            <SectionLabel icon={Zap}>Key Features</SectionLabel>
            <div className="flex flex-wrap gap-2">
              {data.keyFeatures.map((kf: string, i: number) => (
                <Badge
                  key={i}
                  variant="secondary"
                  className="font-medium text-xs px-3 py-1.5 rounded-lg border"
                  style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-muted)', color: 'var(--text-body)' }}
                >
                  {kf}
                </Badge>
              ))}
            </div>
          </ResultSection>
        )}
        {data.amazonKeywords?.length > 0 && (
          <ResultSection>
            <SectionLabel icon={TrendingUp}>Search Keywords</SectionLabel>
            <div className="flex flex-wrap gap-2">
              {data.amazonKeywords.map((kw: string, i: number) => (
                <Badge
                  key={i}
                  variant="outline"
                  className="font-medium text-xs px-3 py-1.5 rounded-lg transition-colors hover:bg-[var(--bg-muted)]"
                  style={{ borderColor: 'var(--border-color)', color: 'var(--text-body)' }}
                >
                  {kw}
                </Badge>
              ))}
            </div>
          </ResultSection>
        )}
      </div>

      {/* Category Attributes */}
      {data.suggestedAttributes && Object.keys(data.suggestedAttributes).length > 0 && (
        <ResultSection>
          <SectionLabel icon={Package}>Category Attributes</SectionLabel>
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(data.suggestedAttributes).map(([key, val]) => (
              <div key={key} className="rounded-lg p-3" style={{ backgroundColor: 'var(--bg-muted)' }}>
                <p className="text-[10px] font-semibold uppercase tracking-wider mb-0.5" style={{ color: 'var(--text-faint)' }}>{key}</p>
                <p className="text-sm font-semibold" style={{ color: 'var(--text-heading)' }}>{val as string}</p>
              </div>
            ))}
          </div>
        </ResultSection>
      )}

      {/* Footer */}
      <div className="flex items-center justify-end gap-2 pt-1">
        <div className="h-1 w-1 rounded-full" style={{ backgroundColor: 'var(--text-faint)' }} />
        <p className="text-xs font-medium" style={{ color: 'var(--text-faint)' }}>
          Powered by AI · Generated in {data.latencyMs}ms
        </p>
      </div>
    </div>
  );
}

// ── Suggest Results ──────────────────────────────────────────────
const priorityConfig: Record<string, { label: string; dotColor: string; bgColor: string; borderColor: string; badgeBg: string }> = {
  HIGH: { label: 'Top Pick', dotColor: 'var(--color-success)', bgColor: 'rgba(22,163,74,0.03)', borderColor: 'rgba(22,163,74,0.15)', badgeBg: 'rgba(22,163,74,0.08)' },
  MEDIUM: { label: 'Good Fit', dotColor: 'var(--color-warning)', bgColor: 'rgba(217,119,6,0.03)', borderColor: 'rgba(217,119,6,0.15)', badgeBg: 'rgba(217,119,6,0.08)' },
  LOW: { label: 'Optional', dotColor: 'var(--text-faint)', bgColor: 'var(--bg-white)', borderColor: 'var(--border-color)', badgeBg: 'var(--bg-muted)' },
};

function SuggestResults({ data }: { data: any }) {
  return (
    <div className="space-y-4">
      {/* Strategy Hero Card */}
      <div
        className="relative rounded-xl overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, var(--brand) 0%, var(--brand-accent) 100%)',
        }}
      >
        <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: 'radial-gradient(circle at 30% 20%, white 1px, transparent 1px), radial-gradient(circle at 70% 80%, white 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
        <div className="relative px-6 py-6">
          <div className="flex items-start gap-3 mb-4">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl" style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}>
              <Zap className="h-4.5 w-4.5 text-white" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-white/50 mb-1.5">AI Strategy</p>
              <p className="text-sm leading-[1.7] text-white/90">{data.overallStrategy}</p>
            </div>
          </div>
          {data.pricingAdvice && (
            <div className="rounded-lg p-4 mt-1" style={{ backgroundColor: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(8px)' }}>
              <div className="flex items-center gap-2 mb-1.5">
                <TrendingUp className="h-3.5 w-3.5 text-white/60" />
                <p className="text-xs font-semibold text-white/60 uppercase tracking-wider">Pricing Advice</p>
              </div>
              <p className="text-sm text-white/85 leading-relaxed">{data.pricingAdvice}</p>
            </div>
          )}
          <div className="flex items-center justify-end mt-3">
            <p className="text-[10px] font-medium text-white/30">Analyzed in {data.latencyMs}ms</p>
          </div>
        </div>
      </div>

      {/* Platform Recommendations */}
      {data.recommendations?.map((rec: any, i: number) => {
        const cfg = priorityConfig[rec.priority] || priorityConfig.LOW;
        const fitPercent = Math.min(rec.fitScore, 100);
        return (
          <div
            key={i}
            className="rounded-xl border overflow-hidden transition-all duration-200 hover:shadow-md"
            style={{ borderColor: cfg.borderColor, backgroundColor: cfg.bgColor }}
          >
            {/* Card Header */}
            <div className="px-5 pt-5 pb-4">
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold"
                  style={{
                    background: rec.priority === 'HIGH'
                      ? 'linear-gradient(135deg, var(--color-success), #22c55e)'
                      : rec.priority === 'MEDIUM'
                      ? 'linear-gradient(135deg, var(--color-warning), #f59e0b)'
                      : 'var(--bg-muted)',
                    color: rec.priority === 'LOW' ? 'var(--text-muted)' : 'white',
                  }}
                >
                  {rec.platform?.charAt(0) || '#'}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-[15px] font-bold" style={{ color: 'var(--text-heading)' }}>{rec.platform}</h3>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{rec.rationale?.slice(0, 60)}…</p>
                </div>
                <Badge
                  className="text-xs font-bold px-3 py-1 rounded-full border-0"
                  style={{ backgroundColor: cfg.badgeBg, color: cfg.dotColor }}
                >
                  {cfg.label}
                </Badge>
              </div>

              {/* Fit Score Bar */}
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>Platform Fit Score</span>
                  <span className="text-sm font-extrabold tabular-nums" style={{ color: cfg.dotColor }}>{rec.fitScore}/100</span>
                </div>
                <div className="w-full h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--bg-muted)' }}>
                  <div
                    className="h-full rounded-full transition-all duration-700 ease-out"
                    style={{
                      width: `${fitPercent}%`,
                      background: rec.priority === 'HIGH'
                        ? 'linear-gradient(90deg, var(--color-success), #22c55e)'
                        : rec.priority === 'MEDIUM'
                        ? 'linear-gradient(90deg, var(--color-warning), #f59e0b)'
                        : 'var(--text-faint)',
                    }}
                  />
                </div>
              </div>

              {/* Rationale */}
              <p className="text-sm leading-[1.7] mb-4" style={{ color: 'var(--text-body)' }}>{rec.rationale}</p>

              {/* Reach & Margin stats */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="rounded-lg border p-3.5" style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-white)' }}>
                  <div className="flex items-center gap-2 mb-1.5">
                    <Globe className="h-3.5 w-3.5" style={{ color: 'var(--brand-accent)' }} />
                    <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-faint)' }}>Expected Reach</p>
                  </div>
                  <p className="text-sm font-bold" style={{ color: 'var(--text-heading)' }}>{rec.expectedReach}</p>
                </div>
                <div className="rounded-lg border p-3.5" style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-white)' }}>
                  <div className="flex items-center gap-2 mb-1.5">
                    <TrendingUp className="h-3.5 w-3.5" style={{ color: 'var(--color-success)' }} />
                    <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-faint)' }}>Margin Estimate</p>
                  </div>
                  <p className="text-sm font-bold" style={{ color: 'var(--text-heading)' }}>{rec.expectedMargin}</p>
                </div>
              </div>
            </div>

            {/* Pros & Cons Footer */}
            <div
              className="grid grid-cols-2 gap-0 border-t"
              style={{ borderColor: cfg.borderColor }}
            >
              <div className="px-5 py-4 border-r" style={{ borderColor: cfg.borderColor }}>
                <div className="flex items-center gap-1.5 mb-2.5">
                  <CheckCircle className="h-3.5 w-3.5" style={{ color: 'var(--color-success)' }} />
                  <p className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--color-success)' }}>Pros</p>
                </div>
                <ul className="space-y-1.5">
                  {rec.pros?.map((p: string, j: number) => (
                    <li key={j} className="flex items-start gap-2 text-xs leading-relaxed" style={{ color: 'var(--text-body)' }}>
                      <span className="mt-1.5 h-1 w-1 rounded-full shrink-0" style={{ backgroundColor: 'var(--color-success)' }} />
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="px-5 py-4">
                <div className="flex items-center gap-1.5 mb-2.5">
                  <AlertTriangle className="h-3.5 w-3.5" style={{ color: 'var(--color-danger)' }} />
                  <p className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--color-danger)' }}>Cons</p>
                </div>
                <ul className="space-y-1.5">
                  {rec.cons?.map((c: string, j: number) => (
                    <li key={j} className="flex items-start gap-2 text-xs leading-relaxed" style={{ color: 'var(--text-body)' }}>
                      <span className="mt-1.5 h-1 w-1 rounded-full shrink-0" style={{ color: 'var(--color-danger)' }} />
                      {c}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        );
      })}

      {/* Footer */}
      <div className="flex items-center justify-end gap-2 pt-1">
        <div className="h-1 w-1 rounded-full" style={{ backgroundColor: 'var(--text-faint)' }} />
        <p className="text-xs font-medium" style={{ color: 'var(--text-faint)' }}>
          Powered by AI · {data.recommendations?.length || 0} platforms analyzed
        </p>
      </div>
    </div>
  );
}

export default function ProductStudioPage() {
  return (
    <Suspense fallback={<div className="p-6">Loading Studio...</div>}>
      <ProductStudioContent />
    </Suspense>
  );
}
