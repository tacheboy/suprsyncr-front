'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  Image as ImageIconLucide,
  Loader2,
  Save,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast';
import { useGetPlatformsQuery } from '@/store/services/sellerApi';
import {
  type StudioCopyColumn,
  type StudioDraft,
  type StudioMetadataColumn,
  type StudioSeoColumn,
  type StudioServices,
  useCreateStudioDraftMutation,
  usePublishStudioDraftMutation,
} from '@/store/services/studioApi';
import { AttributesEditor } from '@/components/studio/AttributesEditor';
import { IdentifiedProductChip } from '@/components/studio/IdentifiedProductChip';
import { ImageDropzone } from '@/components/studio/ImageDropzone';
import { imageFileToDataUrl } from '@/components/studio/imageToDataUrl';
import { MismatchBanner } from '@/components/studio/MismatchBanner';
import { ProvenanceFooter } from '@/components/studio/ProvenanceFooter';
import { ServicePicker } from '@/components/studio/ServicePicker';
import { StringListEditor } from '@/components/studio/StringListEditor';
import { StudioColumnCard } from '@/components/studio/StudioColumnCard';
import { StudioRunningCard } from '@/components/studio/StudioRunningCard';

// ──────────────────────────────────────────────────────────────────────────────

const emptyCopy: StudioCopyColumn = { title: '', bullets: [], description: '' };
const emptySeo: StudioSeoColumn = {
  handle: '',
  tags: [],
  search_terms: [],
  meta_title: '',
  meta_description: '',
};
const emptyMetadata: StudioMetadataColumn = {
  product_type: '',
  vendor: '',
  attributes: {},
  condition: 'new',
};

const POSTURE_HELP: Record<string, string> = {
  conservative:
    'Plays it safe — factual, minimal claims. Best for regulated or premium goods where over-promising hurts.',
  balanced:
    'Sensible default — persuasive but grounded. Good for most catalogue listings.',
  aggressive:
    'Leans into selling — punchier copy and broader keywords to maximise reach. Best when you want visibility fast.',
};

function getErrorMessage(error: unknown, fallback: string): string {
  const e = error as {
    data?: { error?: string; message?: string };
    error?: string;
    message?: string;
  };
  return e?.data?.error || e?.data?.message || e?.message || e?.error || fallback;
}

// ──────────────────────────────────────────────────────────────────────────────

export default function ProductStudioPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { data: platformsResponse, isLoading: platformsLoading } =
    useGetPlatformsQuery();
  const [createStudioDraft, { isLoading: isCreatingDraft }] =
    useCreateStudioDraftMutation();
  const [publishStudioDraft, { isLoading: isPublishing }] =
    usePublishStudioDraftMutation();

  const platforms = useMemo(
    () => platformsResponse?.data ?? [],
    [platformsResponse?.data],
  );

  // form state
  const [storeId, setStoreId] = useState('');
  const [claimedTitle, setClaimedTitle] = useState('');
  const [basePrice, setBasePrice] = useState('');
  const [posture, setPosture] =
    useState<'balanced' | 'aggressive' | 'conservative'>('balanced');
  const [services, setServices] = useState<StudioServices>({
    product: true,
    seo: true,
    platform: true,
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isEncoding, setIsEncoding] = useState(false);

  // engine result state
  const [draft, setDraft] = useState<StudioDraft | null>(null);
  const [copy, setCopy] = useState<StudioCopyColumn | null>(null);
  const [seo, setSeo] = useState<StudioSeoColumn | null>(null);
  const [metadata, setMetadata] = useState<StudioMetadataColumn | null>(null);
  const [acceptMismatch, setAcceptMismatch] = useState(false);
  const [mismatchAttention, setMismatchAttention] = useState(false);

  useEffect(() => {
    if (storeId || platforms.length === 0) return;
    const preferred =
      platforms.find((p) => p.platformType === 'SHOPIFY') ?? platforms[0];
    setStoreId(String(preferred.id));
  }, [platforms, storeId]);

  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  const applyDraft = (next: StudioDraft) => {
    setDraft(next);
    setCopy(next.copyColumn);
    setSeo(next.seoColumn);
    setMetadata(next.metadataColumn);
    setAcceptMismatch(false);
    setMismatchAttention(false);
  };

  const onFileSelected = (file: File) => {
    setImageFile(file);
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImagePreview(URL.createObjectURL(file));
  };

  const clearImage = () => {
    setImageFile(null);
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImagePreview(null);
  };

  const runAi = async () => {
    if (!storeId) {
      toast({
        title: 'Select a connected store',
        description: 'Connect a selling platform before using Product Studio.',
        variant: 'destructive',
      });
      return;
    }
    if (!imageFile) {
      toast({
        title: 'Image required',
        description: 'Add a clear product image for the AI to analyse.',
        variant: 'destructive',
      });
      return;
    }
    if (!claimedTitle.trim()) {
      toast({
        title: 'Product name required',
        description: 'Enter the name you intend to use for this product.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setDraft(null);
      setIsEncoding(true);
      // Downscale + base64-encode client-side. No S3 round-trip, and the
      // vision model can read the image inline regardless of hosting.
      const imageUrl = await imageFileToDataUrl(imageFile);
      setIsEncoding(false);

      const created = await createStudioDraft({
        storeId,
        imageUrl,
        claimedTitle: claimedTitle.trim(),
        posture,
        services,
      }).unwrap();
      applyDraft(created);
      if (created.status === 'FAILED') {
        toast({
          title: 'AI analysis failed',
          description:
            created.errorMessage || 'The draft could not be generated.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Could not create draft',
        description: getErrorMessage(error, 'Please try again.'),
        variant: 'destructive',
      });
    } finally {
      setIsEncoding(false);
    }
  };

  const publish = async () => {
    if (!draft) return;
    // Price is optional. Only validate it if the seller typed something.
    let priceValue: number | undefined;
    if (basePrice.trim()) {
      const n = Number(basePrice);
      if (Number.isNaN(n) || n < 0) {
        toast({
          title: 'Invalid price',
          description: 'Enter a valid price, or leave it blank to set later.',
          variant: 'destructive',
        });
        return;
      }
      priceValue = n;
    }

    try {
      const published = await publishStudioDraft({
        draftId: draft.draftId,
        body: {
          copyColumn: copy ?? undefined,
          seoColumn: seo ?? undefined,
          metadataColumn: metadata ?? undefined,
          basePriceInr: priceValue,
          acceptMismatchOverride: draft.mismatchWarning?.mismatch
            ? acceptMismatch
            : undefined,
        },
      }).unwrap();
      applyDraft(published);
      toast({
        title: 'Product saved and listed',
        description: published.shopifyProductId
          ? `Live in your catalogue and on Shopify (#${published.shopifyProductId}).`
          : published.publishedProductId
            ? `Product #${published.publishedProductId} is now in your catalogue.`
            : 'Your product is now in your catalogue.',
      });
      router.push('/products');
    } catch (error) {
      const status = (error as { status?: number }).status;
      if (status === 409) {
        setMismatchAttention(true);
        document
          .getElementById('studio-mismatch-warning')
          ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        toast({
          title: 'Confirm the mismatch override',
          description: 'Tick the confirmation checkbox before publishing.',
          variant: 'destructive',
        });
        return;
      }
      toast({
        title: 'Could not publish product',
        description: getErrorMessage(error, 'Please try again.'),
        variant: 'destructive',
      });
    }
  };

  const updateCopy = (patch: Partial<StudioCopyColumn>) =>
    setCopy((c) => ({ ...(c ?? emptyCopy), ...patch }));
  const updateSeo = (patch: Partial<StudioSeoColumn>) =>
    setSeo((s) => ({ ...(s ?? emptySeo), ...patch }));
  const updateMetadata = (patch: Partial<StudioMetadataColumn>) =>
    setMetadata((m) => ({ ...(m ?? emptyMetadata), ...patch }));

  const isAnalysing = isEncoding || isCreatingDraft;
  const heroImage = draft?.imageUrl ?? imagePreview ?? null;

  return (
    <TooltipProvider delayDuration={150}>
      <div className="space-y-6 pb-12">
        {/* Header */}
        <div>
          <div className="flex items-center gap-2 text-sm font-medium text-violet-600">
            <Sparkles className="h-4 w-4" /> AI product creation
          </div>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-950">
            Product Studio
          </h1>
          <p className="mt-2 max-w-3xl text-sm text-slate-600">
            Drop one product photo and a name. The AI identifies the product,
            writes the listing, and flags anything that disagrees with what you
            typed — then lists it to your catalogue and Shopify in one click.
          </p>
        </div>

        {/* Input — studio layout: image left, controls right */}
        <Card className="overflow-hidden border-slate-200 shadow-sm">
          <CardContent className="grid gap-6 p-6 lg:grid-cols-[260px_1fr]">
            {/* Image */}
            <div className="space-y-2">
              <Label>Product photo</Label>
              <ImageDropzone
                previewUrl={imagePreview}
                onFile={onFileSelected}
                onClear={clearImage}
                disabled={isAnalysing}
              />
            </div>

            {/* Controls */}
            <div className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="studio-store">Connected store</Label>
                  <select
                    id="studio-store"
                    value={storeId}
                    onChange={(e) => setStoreId(e.target.value)}
                    disabled={platformsLoading || isAnalysing}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    {platforms.length === 0 ? (
                      <option value="">No connected stores</option>
                    ) : (
                      platforms.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.storeName} ({p.platformType})
                        </option>
                      ))
                    )}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="studio-title">Product name</Label>
                  <Input
                    id="studio-title"
                    value={claimedTitle}
                    onChange={(e) => setClaimedTitle(e.target.value)}
                    placeholder="e.g. iPhone 13"
                    disabled={isAnalysing}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="studio-price" className="flex items-center gap-1.5">
                    Base price (₹)
                    <span className="text-xs font-normal text-slate-400">
                      optional
                    </span>
                  </Label>
                  <Input
                    id="studio-price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={basePrice}
                    onChange={(e) => setBasePrice(e.target.value)}
                    placeholder="Set now or later"
                    disabled={isAnalysing}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-1.5">
                    AI posture
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button type="button" className="text-slate-400 hover:text-slate-600">
                          <HelpCircle className="h-3.5 w-3.5" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p className="text-xs leading-5">
                          How boldly the AI writes. Conservative = factual and
                          safe. Balanced = persuasive but grounded. Aggressive =
                          punchy copy and broad keywords for maximum reach.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </Label>
                  <Select
                    value={posture}
                    onValueChange={(v: 'balanced' | 'aggressive' | 'conservative') =>
                      setPosture(v)
                    }
                    disabled={isAnalysing}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="conservative">Conservative</SelectItem>
                      <SelectItem value="balanced">Balanced</SelectItem>
                      <SelectItem value="aggressive">Aggressive</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-slate-500">{POSTURE_HELP[posture]}</p>
                </div>
              </div>

              {/* Services */}
              <div className="space-y-2">
                <Label>What should the AI work on?</Label>
                <ServicePicker
                  value={services}
                  onChange={setServices}
                  disabled={isAnalysing}
                />
              </div>

              <div className="flex justify-end">
                <Button
                  onClick={runAi}
                  disabled={isAnalysing || platforms.length === 0 || !imageFile}
                  size="lg"
                >
                  {isAnalysing ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="mr-2 h-4 w-4" />
                  )}
                  {isEncoding ? 'Preparing image…' : 'Run AI Studio'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Running */}
        {isAnalysing && <StudioRunningCard />}

        {/* Hard failure */}
        {draft?.status === 'FAILED' && (
          <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-red-900">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
            <div>
              <p className="font-semibold">AI analysis failed</p>
              <p className="text-sm">
                {draft.errorMessage ||
                  'Try the analysis again with a different image.'}
              </p>
            </div>
          </div>
        )}

        {/* Results */}
        {draft?.status === 'AI_COMPLETE' && (
          <>
            {/* Hero */}
            <Card className="border-slate-200">
              <CardContent className="flex flex-col gap-4 py-5 sm:flex-row sm:items-center">
                {heroImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={heroImage}
                    alt="Identified product"
                    className="h-24 w-24 shrink-0 rounded-lg border border-slate-200 object-cover"
                  />
                ) : (
                  <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-lg border border-dashed border-slate-200 text-slate-300">
                    <ImageIconLucide className="h-6 w-6" />
                  </div>
                )}
                <div className="min-w-0 flex-1 space-y-2">
                  {draft.identifiedProduct && (
                    <IdentifiedProductChip product={draft.identifiedProduct} />
                  )}
                  <p className="text-sm text-slate-600">
                    You wrote{' '}
                    <span className="font-semibold text-slate-900">
                      “{draft.claimedTitle}”
                    </span>
                    {draft.identifiedProduct?.title && (
                      <>
                        {' '}— AI sees{' '}
                        <span className="font-semibold text-slate-900">
                          {draft.identifiedProduct.title}
                        </span>
                      </>
                    )}
                    .
                  </p>
                </div>
                <span className="inline-flex shrink-0 items-center gap-2 self-start rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-700">
                  <CheckCircle2 className="h-4 w-4" /> Ready to review
                </span>
              </CardContent>
            </Card>

            {/* Mismatch */}
            {draft.mismatchWarning?.mismatch && (
              <div id="studio-mismatch-warning">
                <MismatchBanner
                  warning={draft.mismatchWarning}
                  checked={acceptMismatch}
                  onCheckedChange={(c) => {
                    setAcceptMismatch(c);
                    setMismatchAttention(false);
                  }}
                  attention={mismatchAttention}
                />
              </div>
            )}

            {/* Columns — only the ones that ran */}
            <div className="grid gap-5 lg:grid-cols-3">
              {copy && (
                <StudioColumnCard
                  title="Listing copy"
                  description="Customer-facing title, bullets, and description."
                >
                  <div className="space-y-2">
                    <Label htmlFor="copy-title">Title</Label>
                    <Input
                      id="copy-title"
                      value={copy.title ?? ''}
                      onChange={(e) => updateCopy({ title: e.target.value })}
                    />
                  </div>
                  <StringListEditor
                    label="Bullets"
                    values={copy.bullets ?? []}
                    onChange={(bullets) => updateCopy({ bullets })}
                    placeholder="Add a benefit"
                    emptyHint="No bullets generated — add a few yourself."
                    max={8}
                  />
                  <div className="space-y-2">
                    <Label htmlFor="copy-description">Description</Label>
                    <Textarea
                      id="copy-description"
                      value={copy.description ?? ''}
                      onChange={(e) => updateCopy({ description: e.target.value })}
                      rows={8}
                    />
                  </div>
                </StudioColumnCard>
              )}

              {seo && (
                <StudioColumnCard
                  title="SEO"
                  description="Search handle, tags, and store metadata."
                >
                  <div className="space-y-2">
                    <Label htmlFor="seo-handle">Handle</Label>
                    <Input
                      id="seo-handle"
                      value={seo.handle ?? ''}
                      onChange={(e) => updateSeo({ handle: e.target.value })}
                      className="font-mono text-sm"
                    />
                  </div>
                  <StringListEditor
                    label="Tags"
                    values={seo.tags ?? []}
                    onChange={(tags) => updateSeo({ tags })}
                    placeholder="Add a tag"
                    max={10}
                  />
                  <StringListEditor
                    label="Search terms"
                    values={seo.search_terms ?? []}
                    onChange={(search_terms) => updateSeo({ search_terms })}
                    placeholder="Add a search term"
                    max={6}
                  />
                  <div className="space-y-2">
                    <Label htmlFor="seo-title">Meta title</Label>
                    <Input
                      id="seo-title"
                      value={seo.meta_title ?? ''}
                      onChange={(e) => updateSeo({ meta_title: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="seo-description">Meta description</Label>
                    <Textarea
                      id="seo-description"
                      value={seo.meta_description ?? ''}
                      onChange={(e) =>
                        updateSeo({ meta_description: e.target.value })
                      }
                      rows={4}
                    />
                  </div>
                </StudioColumnCard>
              )}

              {metadata && (
                <StudioColumnCard
                  title="Product metadata"
                  description="Catalogue classification and structured attributes."
                >
                  <div className="space-y-2">
                    <Label htmlFor="metadata-type">Product type</Label>
                    <Input
                      id="metadata-type"
                      value={metadata.product_type ?? ''}
                      onChange={(e) =>
                        updateMetadata({ product_type: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="metadata-vendor">Vendor</Label>
                    <Input
                      id="metadata-vendor"
                      value={metadata.vendor ?? ''}
                      onChange={(e) => updateMetadata({ vendor: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="metadata-condition">Condition</Label>
                    <Select
                      value={metadata.condition ?? 'new'}
                      onValueChange={(v) => updateMetadata({ condition: v })}
                    >
                      <SelectTrigger id="metadata-condition">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="new">New</SelectItem>
                        <SelectItem value="refurbished">Refurbished</SelectItem>
                        <SelectItem value="used">Used</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Attributes</Label>
                    <AttributesEditor
                      value={metadata.attributes ?? {}}
                      onChange={(attributes) => updateMetadata({ attributes })}
                    />
                  </div>
                </StudioColumnCard>
              )}
            </div>

            {/* Provenance + CTA */}
            <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-center">
              <ProvenanceFooter draft={draft} />
              <Button
                onClick={publish}
                disabled={isPublishing}
                size="lg"
                className="md:w-auto"
              >
                {isPublishing ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                Save and List
              </Button>
            </div>
          </>
        )}
      </div>
    </TooltipProvider>
  );
}
