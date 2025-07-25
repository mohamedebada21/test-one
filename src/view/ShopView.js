import React from 'react';
import { ProductCard } from '../components/OtherComponents';

// The main shop page that displays all products
const ShopView = ({ products, addToCart }) => (
  <div>
    <div className="text-center mb-12">
        <h2 className="text-4xl font-extrabold text-[#2F3E46]">Fresh Products</h2>
        <p className="mt-4 text-lg text-gray-700">The juiciest deals, delivered to your door.</p>
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
      {products.map(product => (
        <ProductCard key={product.id} product={product} onAddToCart={() => addToCart(product)} />
      ))}
    </div>
  </div>
);

export default ShopView;
