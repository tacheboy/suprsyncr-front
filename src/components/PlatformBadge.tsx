import { cn } from "@/lib/utils";

interface PlatformBadgeProps {
  platform: string;
  className?: string;
}

const platformColors: Record<string, string> = {
  Shopify: "bg-[#96BF48]/10 text-[#6B8E23] border-[#96BF48]/20",
  Amazon: "bg-[#FF9900]/10 text-[#CC7A00] border-[#FF9900]/20",
  Flipkart: "bg-[#2874F0]/10 text-[#2874F0] border-[#2874F0]/20",
  Blinkit: "bg-[#F5C518]/10 text-[#B8940F] border-[#F5C518]/20",
  WooCommerce: "bg-[#7B2D8E]/10 text-[#7B2D8E] border-[#7B2D8E]/20",
  Meesho: "bg-[#F43397]/10 text-[#F43397] border-[#F43397]/20",
};

export function PlatformBadge({ platform, className }: PlatformBadgeProps) {
  return (
    <span className={cn(
      "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border",
      platformColors[platform] || "bg-marketplace/10 text-marketplace border-marketplace/20",
      className
    )}>
      {platform}
    </span>
  );
}
