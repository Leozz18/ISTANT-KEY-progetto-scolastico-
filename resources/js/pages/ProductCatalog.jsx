import React, { useEffect, useState } from 'react';
import { Link } from '@inertiajs/react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ProductCard from '../components/ProductCard';
import axios from 'axios';
import '../styles/catalog.css';

export default function ProductCatalog({ auth }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [platform, setPlatform] = useState('');
  const [genre, setGenre] = useState('');
  const [sort, setSort] = useState('');
  const [page, setPage] = useState(1);

  const platforms = ['PC', 'PlayStation', 'Xbox', 'Nintendo', 'Mobile'];
  const genres = ['Action', 'RPG', 'Strategy', 'Sports', 'Adventure', 'Puzzle'];

  useEffect(() => {
    fetchProducts();
  }, [search, platform, genre, sort, page]);

  const fetchProducts = () => {
    setLoading(true);
    const params = {
      page,
      ...(search && { search }),
      ...(platform && { platform }),
      ...(genre && { genre }),
      ...(sort && { sort }),
    };

    axios.get('/api/products', { params })
      .then(response => {
        setProducts(response.data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching products:', error);
        setLoading(false);
      });
  };

  const handleAddToCart = (product) => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existingItem = cart.find(item => item.id === product.id);

    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.push({ ...product, quantity: 1 });
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    alert(`${product.title} added to cart!`);
  };

  return (
    <>
      <Header auth={auth} />

      <main className="main-content">
        <div className="container">
          <h1 className="page-title">Game Catalog</h1>

          {/* Filters */}
          <div className="filters">
            <input
              type="text"
              placeholder="Search games..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="search-input"
            />

            <select
              value={platform}
              onChange={(e) => {
                setPlatform(e.target.value);
                setPage(1);
              }}
              className="filter-select"
            >
              <option value="">All Platforms</option>
              {platforms.map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>

            <select
              value={genre}
              onChange={(e) => {
                setGenre(e.target.value);
                setPage(1);
              }}
              className="filter-select"
            >
              <option value="">All Genres</option>
              {genres.map(g => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>

            <select
              value={sort}
              onChange={(e) => {
                setSort(e.target.value);
                setPage(1);
              }}
              className="filter-select"
            >
              <option value="">Sort by</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="rating">Rating</option>
            </select>
          </div>

          {/* Products Grid */}
          {loading ? (
            <div className="loading">Loading products...</div>
          ) : (
            <>
              <div className="products-grid">
                {products.data?.map(product => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onAddToCart={handleAddToCart}
                  />
                ))}
              </div>

              {/* Pagination */}
              <div className="pagination">
                {products.links?.map((link, index) => (
                  <button
                    key={index}
                    onClick={() => setPage(link.label)}
                    className={`pagination-btn ${link.active ? 'active' : ''}`}
                    dangerouslySetInnerHTML={{ __html: link.label }}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}
