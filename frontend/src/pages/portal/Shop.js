import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Check } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useData } from '../../context/DataContext';

export default function Shop() {
  const navigate = useNavigate();
  const { products } = useData();

  return (
    <div className="py-8">
      <div className="app-container">
        <h1 className="text-3xl font-extrabold text-center mb-10 text-gray-800">Choose Your Plan</h1>
        
        {products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">No products available at the moment. Please check back later.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {products.map((product, index) => (
              <div key={product.id} className={`bg-white rounded-xl shadow-sm border flex flex-col relative ${index === 1 ? 'border-primary ring-2 ring-primary/20' : 'border-gray-200'}`}>
                {index === 1 && (
                  <span className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary text-white px-3 py-1 rounded-full text-xs font-bold tracking-wide">
                    MOST POPULAR
                  </span>
                )}
                <div className="p-6 text-center border-b border-gray-100">
                  <h3 className="text-xl font-semibold text-gray-700">{product.name}</h3>
                  <div className="mt-2 text-sm text-gray-500">{product.type}</div>
                  <div className="mt-4 flex items-baseline justify-center">
                    <span className="text-4xl font-extrabold text-gray-900">${product.salePrice}</span>
                    <span className="ml-1 text-lg text-gray-500">/mo</span>
                  </div>
                </div>
                <div className="p-6 flex-1">
                  {product.notes ? (
                    <ul className="space-y-3">
                      {product.notes.split(',').map((feature, idx) => (
                        <li key={idx} className="flex items-center">
                          <Check size={18} className="text-green-500 mr-3 flex-shrink-0" />
                          <span className="text-gray-600">{feature.trim()}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-600 text-sm">{product.type} subscription plan</p>
                  )}
                </div>
                <div className="p-6 bg-gray-50 rounded-b-xl">
                  <AddToCartButton product={product} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function AddToCartButton({ product }){
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const handle = () => {
    addToCart({ id: product.id, name: product.name, price: product.salePrice });
    navigate('/portal/cart');
  };

  return (
    <button onClick={handle} className="w-full py-3 rounded-lg font-semibold transition bg-primary text-white hover:bg-opacity-95">
      Add to Cart
    </button>
  );
}