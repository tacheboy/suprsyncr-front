import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PlatformConnectionForm } from '@/components/PlatformConnectionForm';

// Radix UI Select renders a hidden native <select> element.
// We trigger change on it directly to avoid jsdom scrollIntoView issues.
function selectPlatform(platformValue: string) {
  const nativeSelect = document.querySelector('select[aria-hidden="true"]') as HTMLSelectElement;
  fireEvent.change(nativeSelect, { target: { value: platformValue } });
}

describe('PlatformConnectionForm', () => {
  it('renders the dialog when open', () => {
    render(<PlatformConnectionForm open={true} onOpenChange={() => {}} />);
    const elements = screen.getAllByText('Connect Platform');
    expect(elements.length).toBeGreaterThan(0);
    expect(screen.getByText(/Connect your marketplace account/i)).toBeInTheDocument();
  });

  it('displays platform selection dropdown', () => {
    render(<PlatformConnectionForm open={true} onOpenChange={() => {}} />);
    expect(screen.getByText('Platform *')).toBeInTheDocument();
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('includes all platforms in the select options', () => {
    render(<PlatformConnectionForm open={true} onOpenChange={() => {}} />);
    const selectElement = document.querySelector('select[aria-hidden="true"]');
    expect(selectElement).toBeInTheDocument();
    const options = selectElement?.querySelectorAll('option');
    const optionTexts = Array.from(options || []).map((opt) => opt.textContent);
    expect(optionTexts).toContain('Shopify');
    expect(optionTexts).toContain('Blinkit');
    expect(optionTexts).toContain('WooCommerce');
    expect(optionTexts).toContain('Meesho');
    expect(optionTexts).toContain('Flipkart');
  });

  it('has cancel and submit buttons', () => {
    render(<PlatformConnectionForm open={true} onOpenChange={() => {}} />);
    expect(screen.getByRole('button', { name: /Cancel/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Connect Platform/i })).toBeInTheDocument();
  });

  it('submit button is disabled when no platform is selected', () => {
    render(<PlatformConnectionForm open={true} onOpenChange={() => {}} />);
    const submitButton = screen.getByRole('button', { name: /Connect Platform/i });
    expect(submitButton).toBeDisabled();
  });

  // Req 2.26 - Meesho credential form fields
  describe('Meesho platform form rendering', () => {
    it('displays Meesho-specific credential fields when Meesho is selected', async () => {
      render(<PlatformConnectionForm open={true} onOpenChange={() => {}} />);
      selectPlatform('MEESHO');
      await waitFor(() => {
        expect(screen.getByLabelText(/API Key/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Seller ID/i)).toBeInTheDocument();
      });
    });

    it('shows Store Name field after selecting Meesho', async () => {
      render(<PlatformConnectionForm open={true} onOpenChange={() => {}} />);
      selectPlatform('MEESHO');
      await waitFor(() => {
        expect(screen.getByLabelText(/Store Name/i)).toBeInTheDocument();
      });
    });

    it('shows correct placeholders for Meesho fields', async () => {
      render(<PlatformConnectionForm open={true} onOpenChange={() => {}} />);
      selectPlatform('MEESHO');
      await waitFor(() => {
        expect(screen.getByPlaceholderText('Enter Meesho API Key')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Enter Seller ID')).toBeInTheDocument();
      });
    });
  });

  // Req 2.27 - Flipkart credential form fields
  describe('Flipkart platform form rendering', () => {
    it('displays Flipkart-specific credential fields when Flipkart is selected', async () => {
      render(<PlatformConnectionForm open={true} onOpenChange={() => {}} />);
      selectPlatform('FLIPKART');
      await waitFor(() => {
        expect(screen.getByLabelText(/API Key/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Seller ID/i)).toBeInTheDocument();
      });
    });

    it('shows Store Name field after selecting Flipkart', async () => {
      render(<PlatformConnectionForm open={true} onOpenChange={() => {}} />);
      selectPlatform('FLIPKART');
      await waitFor(() => {
        expect(screen.getByLabelText(/Store Name/i)).toBeInTheDocument();
      });
    });

    it('shows correct placeholders for Flipkart fields', async () => {
      render(<PlatformConnectionForm open={true} onOpenChange={() => {}} />);
      selectPlatform('FLIPKART');
      await waitFor(() => {
        expect(screen.getByPlaceholderText('Enter Flipkart API Key')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Enter Seller ID')).toBeInTheDocument();
      });
    });
  });

  // Req 2.28 / 2.29 - Form validation for required fields
  describe('Form validation', () => {
    it('shows error when submitting without store name', async () => {
      render(<PlatformConnectionForm open={true} onOpenChange={() => {}} />);
      selectPlatform('MEESHO');
      await waitFor(() => screen.getByLabelText(/Store Name/i));
      fireEvent.click(screen.getByRole('button', { name: /Connect Platform/i }));
      await waitFor(() => {
        expect(screen.getByText(/Please enter a store name/i)).toBeInTheDocument();
      });
    });

    it('shows error when submitting Meesho form without credentials', async () => {
      render(<PlatformConnectionForm open={true} onOpenChange={() => {}} />);
      selectPlatform('MEESHO');
      await waitFor(() => screen.getByLabelText(/Store Name/i));
      fireEvent.change(screen.getByLabelText(/Store Name/i), { target: { value: 'My Meesho Store' } });
      fireEvent.click(screen.getByRole('button', { name: /Connect Platform/i }));
      await waitFor(() => {
        expect(screen.getByText(/Please fill in required fields/i)).toBeInTheDocument();
      });
    });

    it('shows error when submitting Flipkart form without credentials', async () => {
      render(<PlatformConnectionForm open={true} onOpenChange={() => {}} />);
      selectPlatform('FLIPKART');
      await waitFor(() => screen.getByLabelText(/Store Name/i));
      fireEvent.change(screen.getByLabelText(/Store Name/i), { target: { value: 'My Flipkart Store' } });
      fireEvent.click(screen.getByRole('button', { name: /Connect Platform/i }));
      await waitFor(() => {
        expect(screen.getByText(/Please fill in required fields/i)).toBeInTheDocument();
      });
    });
  });

  // Req 2.28 / 2.29 - Submit handler calls backend API with correct payload
  describe('API submission', () => {
    afterEach(() => { vi.unstubAllGlobals(); });

    it('calls backend API with correct Meesho payload on submit', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ id: 1, platformType: 'MEESHO' }),
      });
      vi.stubGlobal('fetch', mockFetch);
      render(<PlatformConnectionForm open={true} onOpenChange={() => {}} />);
      selectPlatform('MEESHO');
      await waitFor(() => screen.getByLabelText(/Store Name/i));
      fireEvent.change(screen.getByLabelText(/Store Name/i), { target: { value: 'My Meesho Store' } });
      fireEvent.change(screen.getByPlaceholderText('Enter Meesho API Key'), { target: { value: 'meesho-api-key-123' } });
      fireEvent.change(screen.getByPlaceholderText('Enter Seller ID'), { target: { value: 'seller-456' } });
      fireEvent.click(screen.getByRole('button', { name: /Connect Platform/i }));
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          '/api/seller/platforms',
          expect.objectContaining({
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              platformType: 'MEESHO',
              storeName: 'My Meesho Store',
              credentials: { api_key: 'meesho-api-key-123', seller_id: 'seller-456' },
            }),
          })
        );
      });
    });

    it('calls backend API with correct Flipkart payload on submit', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ id: 2, platformType: 'FLIPKART' }),
      });
      vi.stubGlobal('fetch', mockFetch);
      render(<PlatformConnectionForm open={true} onOpenChange={() => {}} />);
      selectPlatform('FLIPKART');
      await waitFor(() => screen.getByLabelText(/Store Name/i));
      fireEvent.change(screen.getByLabelText(/Store Name/i), { target: { value: 'My Flipkart Store' } });
      fireEvent.change(screen.getByPlaceholderText('Enter Flipkart API Key'), { target: { value: 'flipkart-api-key-789' } });
      fireEvent.change(screen.getByPlaceholderText('Enter Seller ID'), { target: { value: 'seller-101' } });
      fireEvent.click(screen.getByRole('button', { name: /Connect Platform/i }));
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          '/api/seller/platforms',
          expect.objectContaining({
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              platformType: 'FLIPKART',
              storeName: 'My Flipkart Store',
              credentials: { api_key: 'flipkart-api-key-789', seller_id: 'seller-101' },
            }),
          })
        );
      });
    });
  });

  // Req 2.28 / 2.29 - Loading state during authentication
  describe('Loading state', () => {
    afterEach(() => { vi.unstubAllGlobals(); });

    it('shows loading state while Meesho authentication is in progress', async () => {
      vi.stubGlobal('fetch', vi.fn().mockReturnValue(new Promise(() => {})));
      render(<PlatformConnectionForm open={true} onOpenChange={() => {}} />);
      selectPlatform('MEESHO');
      await waitFor(() => screen.getByLabelText(/Store Name/i));
      fireEvent.change(screen.getByLabelText(/Store Name/i), { target: { value: 'My Meesho Store' } });
      fireEvent.change(screen.getByPlaceholderText('Enter Meesho API Key'), { target: { value: 'meesho-api-key-123' } });
      fireEvent.change(screen.getByPlaceholderText('Enter Seller ID'), { target: { value: 'seller-456' } });
      fireEvent.click(screen.getByRole('button', { name: /Connect Platform/i }));
      await waitFor(() => {
        expect(screen.getByText('Connecting...')).toBeInTheDocument();
      });
    });

    it('shows loading state while Flipkart authentication is in progress', async () => {
      vi.stubGlobal('fetch', vi.fn().mockReturnValue(new Promise(() => {})));
      render(<PlatformConnectionForm open={true} onOpenChange={() => {}} />);
      selectPlatform('FLIPKART');
      await waitFor(() => screen.getByLabelText(/Store Name/i));
      fireEvent.change(screen.getByLabelText(/Store Name/i), { target: { value: 'My Flipkart Store' } });
      fireEvent.change(screen.getByPlaceholderText('Enter Flipkart API Key'), { target: { value: 'flipkart-api-key-789' } });
      fireEvent.change(screen.getByPlaceholderText('Enter Seller ID'), { target: { value: 'seller-101' } });
      fireEvent.click(screen.getByRole('button', { name: /Connect Platform/i }));
      await waitFor(() => {
        expect(screen.getByText('Connecting...')).toBeInTheDocument();
      });
    });

    it('disables form inputs during loading', async () => {
      vi.stubGlobal('fetch', vi.fn().mockReturnValue(new Promise(() => {})));
      render(<PlatformConnectionForm open={true} onOpenChange={() => {}} />);
      selectPlatform('MEESHO');
      await waitFor(() => screen.getByLabelText(/Store Name/i));
      const storeNameInput = screen.getByLabelText(/Store Name/i);
      fireEvent.change(storeNameInput, { target: { value: 'My Meesho Store' } });
      fireEvent.change(screen.getByPlaceholderText('Enter Meesho API Key'), { target: { value: 'meesho-api-key-123' } });
      fireEvent.change(screen.getByPlaceholderText('Enter Seller ID'), { target: { value: 'seller-456' } });
      fireEvent.click(screen.getByRole('button', { name: /Connect Platform/i }));
      await waitFor(() => {
        expect(storeNameInput).toBeDisabled();
      });
    });
  });

  // Req 2.30 / 2.31 - Success message on successful connection
  describe('Success message display', () => {
    afterEach(() => { vi.unstubAllGlobals(); });

    it('displays success message after Meesho connection succeeds', async () => {
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ id: 1, platformType: 'MEESHO' }),
      }));
      render(<PlatformConnectionForm open={true} onOpenChange={() => {}} />);
      selectPlatform('MEESHO');
      await waitFor(() => screen.getByLabelText(/Store Name/i));
      fireEvent.change(screen.getByLabelText(/Store Name/i), { target: { value: 'My Meesho Store' } });
      fireEvent.change(screen.getByPlaceholderText('Enter Meesho API Key'), { target: { value: 'meesho-api-key-123' } });
      fireEvent.change(screen.getByPlaceholderText('Enter Seller ID'), { target: { value: 'seller-456' } });
      fireEvent.click(screen.getByRole('button', { name: /Connect Platform/i }));
      await waitFor(() => {
        expect(screen.getByText(/Platform connected successfully/i)).toBeInTheDocument();
      });
    });

    it('displays success message after Flipkart connection succeeds', async () => {
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ id: 2, platformType: 'FLIPKART' }),
      }));
      render(<PlatformConnectionForm open={true} onOpenChange={() => {}} />);
      selectPlatform('FLIPKART');
      await waitFor(() => screen.getByLabelText(/Store Name/i));
      fireEvent.change(screen.getByLabelText(/Store Name/i), { target: { value: 'My Flipkart Store' } });
      fireEvent.change(screen.getByPlaceholderText('Enter Flipkart API Key'), { target: { value: 'flipkart-api-key-789' } });
      fireEvent.change(screen.getByPlaceholderText('Enter Seller ID'), { target: { value: 'seller-101' } });
      fireEvent.click(screen.getByRole('button', { name: /Connect Platform/i }));
      await waitFor(() => {
        expect(screen.getByText(/Platform connected successfully/i)).toBeInTheDocument();
      });
    });

    it('calls onSuccess callback after successful connection', async () => {
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ id: 1, platformType: 'MEESHO' }),
      }));
      const onSuccess = vi.fn();
      render(<PlatformConnectionForm open={true} onOpenChange={() => {}} onSuccess={onSuccess} />);
      selectPlatform('MEESHO');
      await waitFor(() => screen.getByLabelText(/Store Name/i));
      fireEvent.change(screen.getByLabelText(/Store Name/i), { target: { value: 'My Meesho Store' } });
      fireEvent.change(screen.getByPlaceholderText('Enter Meesho API Key'), { target: { value: 'meesho-api-key-123' } });
      fireEvent.change(screen.getByPlaceholderText('Enter Seller ID'), { target: { value: 'seller-456' } });
      fireEvent.click(screen.getByRole('button', { name: /Connect Platform/i }));
      // onSuccess is called after a 2s delay in the component
      await waitFor(() => {
        expect(onSuccess).toHaveBeenCalledTimes(1);
      }, { timeout: 3000 });
    });
  });

  // Req 2.32 / 2.33 - Error message on authentication failure
  describe('Error message display', () => {
    afterEach(() => { vi.unstubAllGlobals(); });

    it('displays error message when Meesho authentication fails with API error', async () => {
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
        ok: false,
        json: async () => ({ message: 'Invalid Meesho API credentials' }),
      }));
      render(<PlatformConnectionForm open={true} onOpenChange={() => {}} />);
      selectPlatform('MEESHO');
      await waitFor(() => screen.getByLabelText(/Store Name/i));
      fireEvent.change(screen.getByLabelText(/Store Name/i), { target: { value: 'My Meesho Store' } });
      fireEvent.change(screen.getByPlaceholderText('Enter Meesho API Key'), { target: { value: 'bad-key' } });
      fireEvent.change(screen.getByPlaceholderText('Enter Seller ID'), { target: { value: 'bad-seller' } });
      fireEvent.click(screen.getByRole('button', { name: /Connect Platform/i }));
      await waitFor(() => {
        expect(screen.getByText('Invalid Meesho API credentials')).toBeInTheDocument();
      });
    });

    it('displays error message when Flipkart authentication fails with API error', async () => {
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
        ok: false,
        json: async () => ({ message: 'Invalid Flipkart API credentials' }),
      }));
      render(<PlatformConnectionForm open={true} onOpenChange={() => {}} />);
      selectPlatform('FLIPKART');
      await waitFor(() => screen.getByLabelText(/Store Name/i));
      fireEvent.change(screen.getByLabelText(/Store Name/i), { target: { value: 'My Flipkart Store' } });
      fireEvent.change(screen.getByPlaceholderText('Enter Flipkart API Key'), { target: { value: 'bad-key' } });
      fireEvent.change(screen.getByPlaceholderText('Enter Seller ID'), { target: { value: 'bad-seller' } });
      fireEvent.click(screen.getByRole('button', { name: /Connect Platform/i }));
      await waitFor(() => {
        expect(screen.getByText('Invalid Flipkart API credentials')).toBeInTheDocument();
      });
    });

    it('displays generic error message on network failure', async () => {
      vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network error')));
      render(<PlatformConnectionForm open={true} onOpenChange={() => {}} />);
      selectPlatform('MEESHO');
      await waitFor(() => screen.getByLabelText(/Store Name/i));
      fireEvent.change(screen.getByLabelText(/Store Name/i), { target: { value: 'My Meesho Store' } });
      fireEvent.change(screen.getByPlaceholderText('Enter Meesho API Key'), { target: { value: 'meesho-api-key-123' } });
      fireEvent.change(screen.getByPlaceholderText('Enter Seller ID'), { target: { value: 'seller-456' } });
      fireEvent.click(screen.getByRole('button', { name: /Connect Platform/i }));
      await waitFor(() => {
        expect(screen.getByText('Network error')).toBeInTheDocument();
      });
    });

    it('displays fallback error message when API returns no message', async () => {
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
        ok: false,
        json: async () => ({}),
      }));
      render(<PlatformConnectionForm open={true} onOpenChange={() => {}} />);
      selectPlatform('FLIPKART');
      await waitFor(() => screen.getByLabelText(/Store Name/i));
      fireEvent.change(screen.getByLabelText(/Store Name/i), { target: { value: 'My Flipkart Store' } });
      fireEvent.change(screen.getByPlaceholderText('Enter Flipkart API Key'), { target: { value: 'flipkart-api-key-789' } });
      fireEvent.change(screen.getByPlaceholderText('Enter Seller ID'), { target: { value: 'seller-101' } });
      fireEvent.click(screen.getByRole('button', { name: /Connect Platform/i }));
      await waitFor(() => {
        expect(screen.getByText('Failed to connect platform')).toBeInTheDocument();
      });
    });
  });
});
