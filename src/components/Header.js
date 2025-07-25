import React from 'react';
import { Icon } from './Icon';
import WatermelonIcon from './WatermeloniconatermelonIcon';

// Header component with navigation
const Header = ({ setView, cartItemCount, isAdmin }) => (
  <header className="bg-white shadow-md sticky top-0 z-30">
    <nav className="container mx-auto px-4 md:px-8 py-3 flex justify-between items-center">
      <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setView('shop')}>
        <WatermelonIcon className="w-10 h-10" />
        <h1 className="text-2xl font-bold text-[#2F3E46]">Watermelon Stand</h1>
      </div>
      <div className="flex items-center space-x-4">
        <button onClick={() => setView('shop')} className="text-gray-700 hover:text-[#F25F5C] transition font-semibold">Shop</button>
        {isAdmin && (
          <button onClick={() => setView('admin')} className="text-gray-700 hover:text-[#F25F5C] transition font-semibold">Admin</button>
        )}
        <button onClick={() => setView('cart')} className="relative text-gray-700 hover:text-[#F25F5C] transition p-2">
          <Icon name="shoppingCart" className="w-6 h-6" />
          {cartItemCount > 0 && (
            <span className="absolute top-0 right-0 bg-[#F25F5C] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
              {cartItemCount}
            </span>
          )}
        </button>
      </div>
    </nav>
  </header>
);

export default Header;
