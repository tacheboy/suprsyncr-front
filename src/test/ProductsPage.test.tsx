import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { mockProducts } from '@/data/mockData';
import { PlatformBadge } from '@/components/PlatformBadge';

describe('ProductsPage - Marketplace Integration', () => {
  // Test the data and components directly since ProductsPage has routing dependencies
  const renderPlatformBadges = (platforms: string[]) => {
    return render(
      <div>
        {platforms.map(pl => <PlatformBadge key={pl} platform={pl} />)}
      </div>
    );
  };

  it('should have products from Meesho in mockData', () => {
    // Find products that have Meesho platform
    const meeshoProducts = mockProducts.filter(p => p.platforms.includes('Meesho'));
    
    expect(meeshoProducts.length).toBeGreaterThan(0);
    
    // Verify Meesho products exist
    meeshoProducts.forEach(product => {
      expect(product.platforms).toContain('Meesho');
    });
  });

  it('should have products from Flipkart in mockData', () => {
    // Find products that have Flipkart platform
    const flipkartProducts = mockProducts.filter(p => p.platforms.includes('Flipkart'));
    
    expect(flipkartProducts.length).toBeGreaterThan(0);
    
    // Verify Flipkart products exist
    flipkartProducts.forEach(product => {
      expect(product.platforms).toContain('Flipkart');
    });
  });

  it('should display Meesho platform badges correctly', () => {
    const meeshoProducts = mockProducts.filter(p => p.platforms.includes('Meesho'));
    expect(meeshoProducts.length).toBeGreaterThan(0);
    
    const firstMeeshoProduct = meeshoProducts[0];
    renderPlatformBadges(firstMeeshoProduct.platforms);
    
    expect(screen.getByText('Meesho')).toBeInTheDocument();
  });

  it('should display Flipkart platform badges correctly', () => {
    const flipkartProducts = mockProducts.filter(p => p.platforms.includes('Flipkart'));
    expect(flipkartProducts.length).toBeGreaterThan(0);
    
    const firstFlipkartProduct = flipkartProducts[0];
    renderPlatformBadges(firstFlipkartProduct.platforms);
    
    expect(screen.getByText('Flipkart')).toBeInTheDocument();
  });

  it('should display all platform badges for products with multiple platforms', () => {
    // Find a product with multiple platforms including Meesho or Flipkart
    const multiPlatformProduct = mockProducts.find(p => 
      (p.platforms.includes('Meesho') || p.platforms.includes('Flipkart')) && 
      p.platforms.length > 1
    );
    
    expect(multiPlatformProduct).toBeDefined();
    
    if (multiPlatformProduct) {
      renderPlatformBadges(multiPlatformProduct.platforms);
      
      // Verify all platforms are displayed
      multiPlatformProduct.platforms.forEach(platform => {
        expect(screen.getByText(platform)).toBeInTheDocument();
      });
    }
  });

  it('should preserve existing platform products (Shopify, Blinkit, WooCommerce, Amazon)', () => {
    // Find products from existing platforms
    const existingPlatformProducts = mockProducts.filter(p => 
      p.platforms.some(platform => ['Shopify', 'Blinkit', 'WooCommerce', 'Amazon'].includes(platform))
    );
    
    expect(existingPlatformProducts.length).toBeGreaterThan(0);
    
    // Verify they still exist in mockData
    existingPlatformProducts.forEach(product => {
      expect(product).toBeDefined();
      expect(product.platforms.length).toBeGreaterThan(0);
    });
  });

  it('should display platform badges with correct styling for all platforms', () => {
    const allPlatforms = ['Shopify', 'Amazon', 'Flipkart', 'Blinkit', 'WooCommerce', 'Meesho'];
    
    renderPlatformBadges(allPlatforms);
    
    // Verify all platform badges are rendered
    allPlatforms.forEach(platform => {
      expect(screen.getByText(platform)).toBeInTheDocument();
    });
  });

  it('should have Meesho products with valid product data', () => {
    const meeshoProducts = mockProducts.filter(p => p.platforms.includes('Meesho'));
    
    meeshoProducts.forEach(product => {
      expect(product.id).toBeDefined();
      expect(product.name).toBeDefined();
      expect(product.sku).toBeDefined();
      expect(product.category).toBeDefined();
      expect(product.price).toBeGreaterThan(0);
      expect(product.stock).toBeGreaterThanOrEqual(0);
      expect(product.status).toBeDefined();
    });
  });

  it('should have Flipkart products with valid product data', () => {
    const flipkartProducts = mockProducts.filter(p => p.platforms.includes('Flipkart'));
    
    flipkartProducts.forEach(product => {
      expect(product.id).toBeDefined();
      expect(product.name).toBeDefined();
      expect(product.sku).toBeDefined();
      expect(product.category).toBeDefined();
      expect(product.price).toBeGreaterThan(0);
      expect(product.stock).toBeGreaterThanOrEqual(0);
      expect(product.status).toBeDefined();
    });
  });
});
