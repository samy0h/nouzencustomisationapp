import { useState, useMemo } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Header } from '../components/Header';
import { HeroBanner } from '../components/HeroBanner';
import { PageHeader } from '../components/PageHeader';
import { SearchBar } from '../components/SearchBar';
import { CategoryFilters } from '../components/CategoryFilters';
import { SortDropdown } from '../components/SortDropdown';
import { ProductGrid } from '../components/ProductGrid';
import { Footer } from '../components/Footer';
import { useProducts } from '../hooks/useProducts';
import type { Product, SortOption } from '../types';

export const Catalog = () => {
  const { t } = useLanguage();
  const { products, loading, error, refetch } = useProducts();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [sortOption, setSortOption] = useState<SortOption>('featured');

  const filteredAndSortedProducts = useMemo(() => {
    let filtered: Product[] = products;

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter((product) =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by category
    if (activeCategory !== 'all') {
      filtered = filtered.filter((product) => product.category === activeCategory);
    }

    // Sort products
    const sorted = [...filtered];
    if (sortOption === 'price-low') {
      sorted.sort((a, b) => a.price - b.price);
    } else if (sortOption === 'price-high') {
      sorted.sort((a, b) => b.price - a.price);
    } else if (sortOption === 'featured') {
      sorted.sort((a, b) => {
        if (a.featured && !b.featured) return -1;
        if (!a.featured && b.featured) return 1;
        return 0;
      });
    }

    return sorted;
  }, [products, searchQuery, activeCategory, sortOption]);

  // Loading state
  if (loading) {
    return (
      <div className="app">
        <Header />
        <HeroBanner />
        <main className="main">
          <div style={{ textAlign: 'center', padding: '64px 20px' }}>
            <div className="spinner" style={{ margin: '0 auto 16px' }}></div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '18px' }}>
              {t.loading}
            </p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="app">
        <Header />
        <HeroBanner />
        <main className="main">
          <div style={{ textAlign: 'center', padding: '64px 20px' }}>
            <svg
              width="64"
              height="64"
              fill="none"
              stroke="var(--crimson)"
              viewBox="0 0 24 24"
              style={{ margin: '0 auto 16px', display: 'block' }}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <p style={{ color: 'var(--text-primary)', fontSize: '20px', marginBottom: '8px', fontWeight: '600' }}>
              {t.error}
            </p>
            <p style={{ color: 'var(--text-secondary)', fontSize: '16px', marginBottom: '24px' }}>
              {error}
            </p>
            <button
              className="customize-btn"
              onClick={refetch}
              style={{ padding: '12px 32px' }}
            >
              {t.retry}
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="app">
      <Header />
      <HeroBanner />

      <main className="main">
        <PageHeader />

        <div className="filter-section">
          <SearchBar value={searchQuery} onChange={setSearchQuery} />

          <div className="filter-row">
            <CategoryFilters
              activeCategory={activeCategory}
              onCategoryChange={setActiveCategory}
            />
            <SortDropdown value={sortOption} onChange={setSortOption} />
          </div>
        </div>

        <ProductGrid products={filteredAndSortedProducts} />
      </main>

      <Footer />
    </div>
  );
};
