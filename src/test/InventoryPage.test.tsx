import { describe, it, expect } from 'vitest';
import { mockInventory, mockListings, mockProducts } from '@/data/mockData';

describe('InventoryPage - Marketplace Integration', () => {
  it('should have inventory data for Meesho products', () => {
    // Find Meesho products
    const meeshoProducts = mockProducts.filter(p => p.platforms.includes('Meesho'));
    expect(meeshoProducts.length).toBeGreaterThan(0);
    
    // Verify inventory exists for Meesho products
    meeshoProducts.forEach(product => {
      const inventoryItem = mockInventory.find(i => i.productId === product.id);
      expect(inventoryItem).toBeDefined();
      expect(inventoryItem?.availableStock).toBeDefined();
      expect(inventoryItem?.totalStock).toBeDefined();
    });
  });

  it('should have inventory data for Flipkart products', () => {
    // Find Flipkart products
    const flipkartProducts = mockProducts.filter(p => p.platforms.includes('Flipkart'));
    expect(flipkartProducts.length).toBeGreaterThan(0);
    
    // Verify inventory exists for Flipkart products
    flipkartProducts.forEach(product => {
      const inventoryItem = mockInventory.find(i => i.productId === product.id);
      expect(inventoryItem).toBeDefined();
      expect(inventoryItem?.availableStock).toBeDefined();
      expect(inventoryItem?.totalStock).toBeDefined();
    });
  });

  it('should have platform-specific listings with stock levels for Meesho', () => {
    const meeshoListings = mockListings.filter(l => l.platform === 'Meesho');
    expect(meeshoListings.length).toBeGreaterThan(0);
    
    meeshoListings.forEach(listing => {
      expect(listing.stock).toBeDefined();
      expect(listing.stock).toBeGreaterThanOrEqual(0);
      expect(listing.productName).toBeDefined();
    });
  });

  it('should have platform-specific listings with stock levels for Flipkart', () => {
    const flipkartListings = mockListings.filter(l => l.platform === 'Flipkart');
    expect(flipkartListings.length).toBeGreaterThan(0);
    
    flipkartListings.forEach(listing => {
      expect(listing.stock).toBeDefined();
      expect(listing.stock).toBeGreaterThanOrEqual(0);
      expect(listing.productName).toBeDefined();
    });
  });

  it('should preserve inventory data for existing platforms', () => {
    const existingPlatforms = ['Shopify', 'Amazon', 'Blinkit', 'WooCommerce'];
    
    existingPlatforms.forEach(platform => {
      const platformListings = mockListings.filter(l => l.platform === platform);
      
      platformListings.forEach(listing => {
        expect(listing.stock).toBeDefined();
        expect(listing.stock).toBeGreaterThanOrEqual(0);
      });
    });
  });

  it('should have valid inventory status for all products including Meesho/Flipkart', () => {
    const meeshoFlipkartProducts = mockProducts.filter(p => 
      p.platforms.includes('Meesho') || p.platforms.includes('Flipkart')
    );
    
    meeshoFlipkartProducts.forEach(product => {
      const inventoryItem = mockInventory.find(i => i.productId === product.id);
      expect(inventoryItem).toBeDefined();
      expect(['in_stock', 'low_stock', 'out_of_stock']).toContain(inventoryItem?.status);
    });
  });

  it('should correctly calculate inventory status based on stock levels', () => {
    mockInventory.forEach(item => {
      if (item.availableStock === 0) {
        expect(item.status).toBe('out_of_stock');
      } else if (item.availableStock < 15) {
        expect(item.status).toBe('low_stock');
      } else {
        expect(item.status).toBe('in_stock');
      }
    });
  });

  it('should have matching stock levels between products and listings for Meesho', () => {
    const meeshoListings = mockListings.filter(l => l.platform === 'Meesho');
    
    meeshoListings.forEach(listing => {
      const product = mockProducts.find(p => p.name === listing.productName);
      if (product) {
        // Stock levels should be close (may vary slightly due to sync timing)
        expect(Math.abs(listing.stock - product.stock)).toBeLessThanOrEqual(5);
      }
    });
  });

  it('should have matching stock levels between products and listings for Flipkart', () => {
    const flipkartListings = mockListings.filter(l => l.platform === 'Flipkart');
    
    flipkartListings.forEach(listing => {
      const product = mockProducts.find(p => p.name === listing.productName);
      if (product) {
        // Stock levels should be close (may vary slightly due to sync timing)
        expect(Math.abs(listing.stock - product.stock)).toBeLessThanOrEqual(5);
      }
    });
  });
});
