import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  ExternalLink,
  Unplug,
  Package,
  ShoppingCart,
  Boxes,
} from "lucide-react";
import { cn } from "@/lib/utils";

type ConnectionStatus = "connected" | "syncing" | "error" | "disconnected";

interface SyncProgress {
  products: number;
  orders: number;
  inventory: number;
}

interface PlatformAccount {
  sellerId: string;
  accountName: string;
}

interface PlatformStatusCardProps {
  platformName: string;
  platformIcon?: string;
  platformColor?: string;
  status: ConnectionStatus;
  lastSyncTimestamp?: string;
  account?: PlatformAccount;
  syncProgress?: SyncProgress;
  errorMessage?: string;
  onDisconnect?: () => void | Promise<void>;
  onClick?: () => void;
  className?: string;
}

export function PlatformStatusCard({
  platformName,
  platformIcon = "🛍️",
  platformColor = "#6B7280",
  status,
  lastSyncTimestamp,
  account,
  syncProgress,
  errorMessage,
  onDisconnect,
  onClick,
  className,
}: PlatformStatusCardProps) {
  const [showDisconnectDialog, setShowDisconnectDialog] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);

  const handleDisconnect = async () => {
    if (!onDisconnect) return;

    setIsDisconnecting(true);
    try {
      await onDisconnect();
      setShowDisconnectDialog(false);
    } catch (error) {
      console.error("Failed to disconnect platform:", error);
    } finally {
      setIsDisconnecting(false);
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case "connected":
        return <CheckCircle2 className="h-4 w-4 text-success" />;
      case "syncing":
        return <Loader2 className="h-4 w-4 text-primary animate-spin" />;
      case "error":
        return <XCircle className="h-4 w-4 text-destructive" />;
      case "disconnected":
        return <AlertCircle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case "connected":
        return "Connected";
      case "syncing":
        return "Syncing...";
      case "error":
        return "Error";
      case "disconnected":
        return "Disconnected";
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case "connected":
        return "bg-success/10 text-success border-success/20";
      case "syncing":
        return "bg-primary/10 text-primary border-primary/20";
      case "error":
        return "bg-destructive/10 text-destructive border-destructive/20";
      case "disconnected":
        return "bg-muted text-muted-foreground border-muted";
    }
  };

  const formatTimestamp = (timestamp?: string) => {
    if (!timestamp) return "Never";
    
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? "s" : ""} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
    
    return date.toLocaleDateString();
  };

  return (
    <>
      <Card
        className={cn(
          "transition-all hover:shadow-md",
          status === "connected" && "border-success/30",
          status === "error" && "border-destructive/30",
          onClick && "cursor-pointer",
          className
        )}
        onClick={onClick}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{platformIcon}</span>
              <div>
                <h3 className="text-base font-semibold text-foreground">
                  {platformName}
                </h3>
                <div className="flex items-center gap-1.5 mt-1">
                  {getStatusIcon()}
                  <span className="text-xs text-muted-foreground">
                    {getStatusText()}
                  </span>
                </div>
              </div>
            </div>
            <Badge
              variant="outline"
              className={cn("text-xs font-medium", getStatusColor())}
            >
              {getStatusText()}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-3 pb-4">
          {/* Account Details */}
          {account && status !== "disconnected" && (
            <div className="rounded-lg border bg-muted/30 p-3 space-y-1">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-foreground">
                  {account.accountName}
                </p>
                {onClick && (
                  <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
                )}
              </div>
              <p className="text-xs text-muted-foreground font-mono">
                ID: {account.sellerId}
              </p>
            </div>
          )}

          {/* Error Message */}
          {status === "error" && errorMessage && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
                <p className="text-xs text-destructive">{errorMessage}</p>
              </div>
            </div>
          )}

          {/* Sync Progress */}
          {status === "syncing" && syncProgress && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground">
                Sync Progress
              </p>
              <div className="space-y-2">
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      <Package className="h-3 w-3 text-muted-foreground" />
                      <span className="text-muted-foreground">Products</span>
                    </div>
                    <span className="font-medium">{syncProgress.products}%</span>
                  </div>
                  <Progress value={syncProgress.products} className="h-1.5" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      <ShoppingCart className="h-3 w-3 text-muted-foreground" />
                      <span className="text-muted-foreground">Orders</span>
                    </div>
                    <span className="font-medium">{syncProgress.orders}%</span>
                  </div>
                  <Progress value={syncProgress.orders} className="h-1.5" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      <Boxes className="h-3 w-3 text-muted-foreground" />
                      <span className="text-muted-foreground">Inventory</span>
                    </div>
                    <span className="font-medium">{syncProgress.inventory}%</span>
                  </div>
                  <Progress value={syncProgress.inventory} className="h-1.5" />
                </div>
              </div>
            </div>
          )}

          {/* Last Sync Timestamp */}
          {status !== "disconnected" && (
            <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
              <span>Last synced</span>
              <span className="font-medium">{formatTimestamp(lastSyncTimestamp)}</span>
            </div>
          )}
        </CardContent>

        {/* Disconnect Button */}
        {status !== "disconnected" && onDisconnect && (
          <CardFooter className="pt-0">
            <Button
              variant="outline"
              size="sm"
              className="w-full text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={(e) => {
                e.stopPropagation();
                setShowDisconnectDialog(true);
              }}
            >
              <Unplug className="h-3.5 w-3.5 mr-1.5" />
              Disconnect
            </Button>
          </CardFooter>
        )}
      </Card>

      {/* Disconnect Confirmation Dialog */}
      <AlertDialog open={showDisconnectDialog} onOpenChange={setShowDisconnectDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Disconnect {platformName}?</AlertDialogTitle>
            <AlertDialogDescription>
              This will disconnect your {platformName} account and stop syncing products,
              orders, and inventory. You can reconnect at any time.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDisconnecting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDisconnect}
              disabled={isDisconnecting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isDisconnecting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isDisconnecting ? "Disconnecting..." : "Disconnect"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
