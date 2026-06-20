import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertCircle, CheckCircle2 } from "lucide-react";

type PlatformType = "SHOPIFY" | "BLINKIT" | "WOOCOMMERCE" | "MEESHO" | "FLIPKART";

interface PlatformConnectionFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

interface PlatformConfig {
  label: string;
  fields: Array<{
    key: string;
    label: string;
    type: string;
    placeholder: string;
    required: boolean;
  }>;
}

const platformConfigs: Record<PlatformType, PlatformConfig> = {
  SHOPIFY: {
    label: "Shopify",
    fields: [
      { key: "shop_url", label: "Shop URL", type: "text", placeholder: "mystore.myshopify.com", required: true },
      { key: "api_key", label: "API Key", type: "text", placeholder: "Enter API Key", required: true },
      { key: "api_secret", label: "API Secret", type: "password", placeholder: "Enter API Secret", required: true },
      { key: "access_token", label: "Access Token", type: "password", placeholder: "Enter Access Token", required: true },
    ],
  },
  BLINKIT: {
    label: "Blinkit",
    fields: [
      { key: "api_url", label: "API URL", type: "text", placeholder: "https://api.blinkit.com", required: true },
      { key: "api_token", label: "API Token", type: "password", placeholder: "Enter API Token", required: true },
    ],
  },
  WOOCOMMERCE: {
    label: "WooCommerce",
    fields: [
      { key: "store_url", label: "Store URL", type: "text", placeholder: "https://mystore.com", required: true },
      { key: "consumer_key", label: "Consumer Key", type: "text", placeholder: "Enter Consumer Key", required: true },
      { key: "consumer_secret", label: "Consumer Secret", type: "password", placeholder: "Enter Consumer Secret", required: true },
    ],
  },
  MEESHO: {
    label: "Meesho",
    fields: [
      { key: "api_key", label: "API Key", type: "password", placeholder: "Enter Meesho API Key", required: true },
      { key: "seller_id", label: "Seller ID", type: "text", placeholder: "Enter Seller ID", required: true },
    ],
  },
  FLIPKART: {
    label: "Flipkart",
    fields: [
      { key: "api_key", label: "API Key", type: "password", placeholder: "Enter Flipkart API Key", required: true },
      { key: "seller_id", label: "Seller ID", type: "text", placeholder: "Enter Seller ID", required: true },
    ],
  },
};

export function PlatformConnectionForm({
  open,
  onOpenChange,
  onSuccess,
}: PlatformConnectionFormProps) {
  const [selectedPlatform, setSelectedPlatform] = useState<PlatformType | "">("");
  const [storeName, setStoreName] = useState("");
  const [credentials, setCredentials] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handlePlatformChange = (platform: PlatformType) => {
    setSelectedPlatform(platform);
    setCredentials({});
    setError(null);
    setSuccess(false);
  };

  const handleCredentialChange = (key: string, value: string) => {
    setCredentials((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedPlatform) {
      setError("Please select a platform");
      return;
    }

    if (!storeName.trim()) {
      setError("Please enter a store name");
      return;
    }

    const config = platformConfigs[selectedPlatform];
    const missingFields = config.fields
      .filter((field) => field.required && !credentials[field.key]?.trim())
      .map((field) => field.label);

    if (missingFields.length > 0) {
      setError(`Please fill in required fields: ${missingFields.join(", ")}`);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/seller/platforms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          platformType: selectedPlatform,
          storeName: storeName.trim(),
          credentials,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to connect platform");
      }

      setSuccess(true);
      setError(null);

      // Reset form after short delay
      setTimeout(() => {
        setSelectedPlatform("");
        setStoreName("");
        setCredentials({});
        setSuccess(false);
        onOpenChange(false);
        onSuccess?.();
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setSelectedPlatform("");
    setStoreName("");
    setCredentials({});
    setError(null);
    setSuccess(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Connect Platform</DialogTitle>
          <DialogDescription>
            Connect your marketplace account to start syncing products, orders, and inventory.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            {/* Platform Selection */}
            <div className="space-y-2">
              <Label htmlFor="platform">Platform *</Label>
              <Select
                value={selectedPlatform}
                onValueChange={(value) => handlePlatformChange(value as PlatformType)}
              >
                <SelectTrigger id="platform">
                  <SelectValue placeholder="Select a platform" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SHOPIFY">Shopify</SelectItem>
                  <SelectItem value="BLINKIT">Blinkit</SelectItem>
                  <SelectItem value="WOOCOMMERCE">WooCommerce</SelectItem>
                  <SelectItem value="MEESHO">Meesho</SelectItem>
                  <SelectItem value="FLIPKART">Flipkart</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Store Name */}
            {selectedPlatform && (
              <div className="space-y-2">
                <Label htmlFor="storeName">Store Name *</Label>
                <Input
                  id="storeName"
                  type="text"
                  placeholder="Enter a name for this connection"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  disabled={loading}
                />
              </div>
            )}

            {/* Platform-Specific Credential Fields */}
            {selectedPlatform &&
              platformConfigs[selectedPlatform].fields.map((field) => (
                <div key={field.key} className="space-y-2">
                  <Label htmlFor={field.key}>
                    {field.label} {field.required && "*"}
                  </Label>
                  <Input
                    id={field.key}
                    type={field.type}
                    placeholder={field.placeholder}
                    value={credentials[field.key] || ""}
                    onChange={(e) => handleCredentialChange(field.key, e.target.value)}
                    disabled={loading}
                  />
                </div>
              ))}

            {/* Error Message */}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Success Message */}
            {success && (
              <Alert className="border-green-500 bg-green-50 text-green-900">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription>
                  Platform connected successfully! Redirecting...
                </AlertDescription>
              </Alert>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !selectedPlatform}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? "Connecting..." : "Connect Platform"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
