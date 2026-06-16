'use client';
import { Link } from 'react-router-dom';
import { useWishlist } from '../contexts/WishlistContext';

const Wishlist = () => {
  const { items, removeFromWishlist, clearWishlist } = useWishlist();

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-8 pt-40 pb-16">
      <div className="flex items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-serif text-[#222]">Your Wishlist</h1>
          <p className="text-sm text-[#666] mt-2">Saved items you can revisit anytime.</p>
        </div>
        {items.length > 0 && (
          <button
            type="button"
            onClick={clearWishlist}
            className="px-4 py-2 border border-[#222] text-[#222] text-sm uppercase tracking-wider hover:bg-[#222] hover:text-white transition-colors"
          >
            Clear All
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="border border-[#e8e3db] bg-[#fbf8f3] p-10 text-center">
          <p className="text-lg text-[#333]">No products in your wishlist yet.</p>
          <Link
            to="/products"
            className="inline-block mt-4 px-6 py-2 bg-[#222] text-white text-sm uppercase tracking-wider hover:bg-black transition-colors"
          >
            Explore Products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <article key={item.id} className="border border-[#ece7df] bg-white overflow-hidden">
              <Link to={item.href || '/products'} className="block aspect-[4/5] bg-[#f5f2ec] overflow-hidden">
                {item.image ? (
                  <img src={item.image} alt={item.title} className="w-full h-full object-cover" loading="lazy" />
                ) : (
                  <div className="w-full h-full bg-[#f5f2ec]" />
                )}
              </Link>
              <div className="p-4">
                <h2 className="text-base text-[#222] font-medium leading-tight">{item.title}</h2>
                {item.designer && <p className="text-sm text-[#666] mt-1">{item.designer}</p>}
                {item.price && <p className="text-sm text-[#222] mt-2">{item.price}</p>}
                <div className="mt-4 flex items-center justify-between">
                  <Link
                    to={item.href || '/products'}
                    className="text-xs uppercase tracking-wider text-[#222] border-b border-[#222] hover:opacity-70"
                  >
                    View Product
                  </Link>
                  <button
                    type="button"
                    onClick={() => removeFromWishlist(item.id)}
                    className="text-xs uppercase tracking-wider text-[#8b3a3a] hover:text-[#6f2e2e]"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};

export default Wishlist;
