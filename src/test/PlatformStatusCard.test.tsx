import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PlatformStatusCard } from '@/components/PlatformStatusCard';

describe('PlatformStatusCard', () => {
  const mockAccount = {
    sellerId: 'MEESHO-12345',
    accountName: 'My Meesho Store',
  };

  const mockSyncProgress = {
    products: 75,
    orders: 50,
    inventory: 90,
  };

  describe('Status Display', () => {
    it('renders connected status correctly', () => {
      render(
        <PlatformStatusCard
          platformName="Meesho"
          status="connected"
          account={mockAccount}
        />
      );

      expect(screen.getByText('Meesho')).toBeInTheDocument();
      expect(screen.getAllByText('Connected').length).toBeGreaterThan(0);
    });

    it('renders syncing status with progress bars', () => {
      render(
        <PlatformStatusCard
          platformName="Flipkart"
          status="syncing"
          account={mockAccount}
          syncProgress={mockSyncProgress}
        />
      );

      expect(screen.getAllByText('Syncing...').length).toBeGreaterThan(0);
      expect(screen.getByText('Sync Progress')).toBeInTheDocument();
      expect(screen.getByText('Products')).toBeInTheDocument();
      expect(screen.getByText('Orders')).toBeInTheDocument();
      expect(screen.getByText('Inventory')).toBeInTheDocument();
      expect(screen.getByText('75%')).toBeInTheDocument();
      expect(screen.getByText('50%')).toBeInTheDocument();
      expect(screen.getByText('90%')).toBeInTheDocument();
    });

    it('renders error status with error message', () => {
      const errorMessage = 'Failed to authenticate with Meesho API';
      render(
        <PlatformStatusCard
          platformName="Meesho"
          status="error"
          account={mockAccount}
          errorMessage={errorMessage}
        />
      );

      expect(screen.getAllByText('Error').length).toBeGreaterThan(0);
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });

    it('renders disconnected status', () => {
      render(
        <PlatformStatusCard
          platformName="Meesho"
          status="disconnected"
        />
      );

      expect(screen.getAllByText('Disconnected').length).toBeGreaterThan(0);
    });
  });

  describe('Account Details', () => {
    it('displays account name and seller ID when connected', () => {
      render(
        <PlatformStatusCard
          platformName="Meesho"
          status="connected"
          account={mockAccount}
        />
      );

      expect(screen.getByText('My Meesho Store')).toBeInTheDocument();
      expect(screen.getByText('ID: MEESHO-12345')).toBeInTheDocument();
    });

    it('does not display account details when disconnected', () => {
      render(
        <PlatformStatusCard
          platformName="Meesho"
          status="disconnected"
          account={mockAccount}
        />
      );

      expect(screen.queryByText('My Meesho Store')).not.toBeInTheDocument();
      expect(screen.queryByText('ID: MEESHO-12345')).not.toBeInTheDocument();
    });
  });

  describe('Last Sync Timestamp', () => {
    it('displays "Just now" for recent syncs', () => {
      const now = new Date().toISOString();
      render(
        <PlatformStatusCard
          platformName="Meesho"
          status="connected"
          lastSyncTimestamp={now}
        />
      );

      expect(screen.getByText('Just now')).toBeInTheDocument();
    });

    it('displays "Never" when no timestamp provided', () => {
      render(
        <PlatformStatusCard
          platformName="Meesho"
          status="connected"
        />
      );

      expect(screen.getByText('Never')).toBeInTheDocument();
    });

    it('displays minutes ago for recent syncs', () => {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
      render(
        <PlatformStatusCard
          platformName="Meesho"
          status="connected"
          lastSyncTimestamp={fiveMinutesAgo}
        />
      );

      expect(screen.getByText('5 mins ago')).toBeInTheDocument();
    });

    it('does not display timestamp when disconnected', () => {
      render(
        <PlatformStatusCard
          platformName="Meesho"
          status="disconnected"
          lastSyncTimestamp={new Date().toISOString()}
        />
      );

      expect(screen.queryByText('Last synced')).not.toBeInTheDocument();
    });
  });

  describe('Disconnect Functionality', () => {
    it('shows disconnect button when connected', () => {
      const onDisconnect = vi.fn();
      render(
        <PlatformStatusCard
          platformName="Meesho"
          status="connected"
          account={mockAccount}
          onDisconnect={onDisconnect}
        />
      );

      expect(screen.getByRole('button', { name: /disconnect/i })).toBeInTheDocument();
    });

    it('does not show disconnect button when disconnected', () => {
      const onDisconnect = vi.fn();
      render(
        <PlatformStatusCard
          platformName="Meesho"
          status="disconnected"
          onDisconnect={onDisconnect}
        />
      );

      expect(screen.queryByRole('button', { name: /disconnect/i })).not.toBeInTheDocument();
    });

    it('opens confirmation dialog when disconnect button is clicked', async () => {
      const onDisconnect = vi.fn();
      render(
        <PlatformStatusCard
          platformName="Meesho"
          status="connected"
          account={mockAccount}
          onDisconnect={onDisconnect}
        />
      );

      const disconnectButton = screen.getByRole('button', { name: /disconnect/i });
      fireEvent.click(disconnectButton);

      await waitFor(() => {
        expect(screen.getByText('Disconnect Meesho?')).toBeInTheDocument();
      });
    });

    it('calls onDisconnect when confirmed', async () => {
      const onDisconnect = vi.fn().mockResolvedValue(undefined);
      render(
        <PlatformStatusCard
          platformName="Meesho"
          status="connected"
          account={mockAccount}
          onDisconnect={onDisconnect}
        />
      );

      // Click disconnect button
      const disconnectButton = screen.getByRole('button', { name: /disconnect/i });
      fireEvent.click(disconnectButton);

      // Wait for dialog and confirm
      await waitFor(() => {
        expect(screen.getByText('Disconnect Meesho?')).toBeInTheDocument();
      });

      const confirmButton = screen.getByRole('button', { name: /^disconnect$/i });
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(onDisconnect).toHaveBeenCalledTimes(1);
      });
    });

    it('does not call onDisconnect when cancelled', async () => {
      const onDisconnect = vi.fn();
      render(
        <PlatformStatusCard
          platformName="Meesho"
          status="connected"
          account={mockAccount}
          onDisconnect={onDisconnect}
        />
      );

      // Click disconnect button
      const disconnectButton = screen.getByRole('button', { name: /disconnect/i });
      fireEvent.click(disconnectButton);

      // Wait for dialog and cancel
      await waitFor(() => {
        expect(screen.getByText('Disconnect Meesho?')).toBeInTheDocument();
      });

      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      fireEvent.click(cancelButton);

      await waitFor(() => {
        expect(onDisconnect).not.toHaveBeenCalled();
      });
    });
  });

  describe('Click Handler', () => {
    it('calls onClick when card is clicked', () => {
      const onClick = vi.fn();
      render(
        <PlatformStatusCard
          platformName="Meesho"
          status="connected"
          account={mockAccount}
          onClick={onClick}
        />
      );

      const card = screen.getByText('Meesho').closest('div')?.parentElement?.parentElement;
      if (card) {
        fireEvent.click(card);
        expect(onClick).toHaveBeenCalledTimes(1);
      }
    });

    it('does not propagate click when disconnect button is clicked', async () => {
      const onClick = vi.fn();
      const onDisconnect = vi.fn();
      render(
        <PlatformStatusCard
          platformName="Meesho"
          status="connected"
          account={mockAccount}
          onClick={onClick}
          onDisconnect={onDisconnect}
        />
      );

      const disconnectButton = screen.getByRole('button', { name: /disconnect/i });
      fireEvent.click(disconnectButton);

      // onClick should not be called when disconnect button is clicked
      expect(onClick).not.toHaveBeenCalled();
    });
  });

  describe('Platform Customization', () => {
    it('displays custom platform icon', () => {
      render(
        <PlatformStatusCard
          platformName="Meesho"
          platformIcon="🛒"
          status="connected"
        />
      );

      expect(screen.getByText('🛒')).toBeInTheDocument();
    });

    it('uses default icon when not provided', () => {
      render(
        <PlatformStatusCard
          platformName="Meesho"
          status="connected"
        />
      );

      expect(screen.getByText('🛍️')).toBeInTheDocument();
    });
  });

  describe('Bug Condition Validation', () => {
    it('supports Meesho platform display', () => {
      render(
        <PlatformStatusCard
          platformName="Meesho"
          status="connected"
          account={mockAccount}
        />
      );

      expect(screen.getByText('Meesho')).toBeInTheDocument();
      expect(screen.getAllByText('Connected').length).toBeGreaterThan(0);
    });

    it('supports Flipkart platform display', () => {
      render(
        <PlatformStatusCard
          platformName="Flipkart"
          status="connected"
          account={{
            sellerId: 'FLIPKART-67890',
            accountName: 'My Flipkart Store',
          }}
        />
      );

      expect(screen.getByText('Flipkart')).toBeInTheDocument();
      expect(screen.getAllByText('Connected').length).toBeGreaterThan(0);
      expect(screen.getByText('My Flipkart Store')).toBeInTheDocument();
    });

    it('allows managing Meesho connections via disconnect', async () => {
      const onDisconnect = vi.fn().mockResolvedValue(undefined);
      render(
        <PlatformStatusCard
          platformName="Meesho"
          status="connected"
          account={mockAccount}
          onDisconnect={onDisconnect}
        />
      );

      const disconnectButton = screen.getByRole('button', { name: /disconnect/i });
      expect(disconnectButton).toBeInTheDocument();
      
      fireEvent.click(disconnectButton);
      
      await waitFor(() => {
        expect(screen.getByText('Disconnect Meesho?')).toBeInTheDocument();
      });
    });

    it('allows managing Flipkart connections via disconnect', async () => {
      const onDisconnect = vi.fn().mockResolvedValue(undefined);
      render(
        <PlatformStatusCard
          platformName="Flipkart"
          status="connected"
          account={{
            sellerId: 'FLIPKART-67890',
            accountName: 'My Flipkart Store',
          }}
          onDisconnect={onDisconnect}
        />
      );

      const disconnectButton = screen.getByRole('button', { name: /disconnect/i });
      expect(disconnectButton).toBeInTheDocument();
      
      fireEvent.click(disconnectButton);
      
      await waitFor(() => {
        expect(screen.getByText('Disconnect Flipkart?')).toBeInTheDocument();
      });
    });
  });

  describe('Preservation - Existing Platform Support', () => {
    it('supports Shopify platform display', () => {
      render(
        <PlatformStatusCard
          platformName="Shopify"
          status="connected"
          account={{
            sellerId: 'SHOPIFY-11111',
            accountName: 'My Shopify Store',
          }}
        />
      );

      expect(screen.getByText('Shopify')).toBeInTheDocument();
      expect(screen.getAllByText('Connected').length).toBeGreaterThan(0);
    });

    it('supports Blinkit platform display', () => {
      render(
        <PlatformStatusCard
          platformName="Blinkit"
          status="connected"
          account={{
            sellerId: 'BLINKIT-22222',
            accountName: 'My Blinkit Store',
          }}
        />
      );

      expect(screen.getByText('Blinkit')).toBeInTheDocument();
      expect(screen.getAllByText('Connected').length).toBeGreaterThan(0);
    });

    it('supports WooCommerce platform display', () => {
      render(
        <PlatformStatusCard
          platformName="WooCommerce"
          status="connected"
          account={{
            sellerId: 'WOO-33333',
            accountName: 'My WooCommerce Store',
          }}
        />
      );

      expect(screen.getByText('WooCommerce')).toBeInTheDocument();
      expect(screen.getAllByText('Connected').length).toBeGreaterThan(0);
    });
  });
});
