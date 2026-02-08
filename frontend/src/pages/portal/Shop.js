import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, X } from 'lucide-react';
import axios from 'axios';
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
              <ProductCard key={product.id} product={product} isPopular={index === 1} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ProductCard({ product, isPopular }) {
  const [billingCycle, setBillingCycle] = useState('Weekly');

  const getMultiplier = (cycle) => {
    switch (cycle) {
      case 'Weekly': return 1;
      case 'Monthly': return 4;
      case 'Yearly': return 52;
      default: return 1;
    }
  };

  const basePricePerWeek = parseFloat(product.salePrice) || 0;
  const currentPrice = basePricePerWeek * getMultiplier(billingCycle);

  return (
    <div className={`bg-white rounded-xl shadow-sm border flex flex-col relative ${isPopular ? 'border-primary ring-2 ring-primary/20' : 'border-gray-200'}`}>
      {isPopular && (
        <span className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary text-white px-3 py-1 rounded-full text-xs font-bold tracking-wide">
          MOST POPULAR
        </span>
      )}
      <div className="p-6 text-center border-b border-gray-100">
        <h3 className="text-xl font-semibold text-gray-700">{product.name}</h3>
        <div className="mt-2 text-sm text-gray-500">{product.type}</div>
        
        {/* Billing Cycle Selector */}
        <div className="mt-4 flex justify-center bg-gray-100 rounded-lg p-1 mx-auto max-w-[240px]">
          {['Weekly', 'Monthly', 'Yearly'].map((cycle) => (
            <button
              key={cycle}
              onClick={() => setBillingCycle(cycle)}
              className={`flex-1 text-xs font-semibold py-1.5 rounded-md transition-all ${
                billingCycle === cycle
                  ? 'bg-white text-gray-800 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {cycle}
            </button>
          ))}
        </div>

        <div className="mt-4 flex items-baseline justify-center">
          <span className="text-4xl font-extrabold text-gray-900">${currentPrice.toFixed(2)}</span>
          <span className="ml-1 text-lg text-gray-500">/{billingCycle.toLowerCase().slice(0, -2)}</span>
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
        <AddToCartButton product={product} billingCycle={billingCycle} currentPrice={currentPrice} />
      </div>
    </div>
  );
}

function AddToCartButton({ product, billingCycle, currentPrice }){
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [showVariantModal, setShowVariantModal] = useState(false);
  const [variants, setVariants] = useState([]);
  
  useEffect(() => {
    const fetchVariants = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/variants/product/${product.id}`);
        setVariants(res.data || []);
      } catch (e) {
        console.error('Failed to fetch variants:', e);
        setVariants([]);
      }
    };

    fetchVariants();
  }, [product.id]);

  const handle = () => {
    if (variants.length > 0) {
      setShowVariantModal(true);
    } else {
      // No variants, add base product directly
      addToCart({
        id: product.id,
        name: product.name,
        price: currentPrice,
        variantId: null,
        variantName: 'Standard',
        additionalPrice: 0,
        basePrice: currentPrice,
        billingCycle: billingCycle // Pass selected cycle
      });
      navigate('/portal/cart');
    }
  };

  const getMultiplier = (cycle) => {
     switch (cycle) {
      case 'Weekly': return 1;
      case 'Monthly': return 4;
      case 'Yearly': return 52;
      default: return 1;
    }
  };
  const multiplier = getMultiplier(billingCycle);

  const handleSelectVariant = (variant) => {
    const additionalBase = parseFloat(variant.additional_price) || 0;
    // Apply multiplier to additional price as well? Protocol is vague, but usually variants invoke extra cost per period.
    const additional = additionalBase * multiplier; 
    
    // Recalculate base from currentPrice to be safe or use passed prop
    const base = currentPrice;
    const totalPrice = base + additional;

    addToCart({
      id: product.id,
      name: product.name,
      price: totalPrice,
      variantId: variant.id,
      variantName: variant.name,
      additionalPrice: additional,
      basePrice: base,
      billingCycle: billingCycle
    });
    setShowVariantModal(false);
    navigate('/portal/cart');
  };

  const handleSelectBase = () => {
    const base = currentPrice;
    addToCart({
      id: product.id,
      name: product.name,
      price: base,
      variantId: null,
      variantName: 'Standard',
      additionalPrice: 0,
      basePrice: base,
      billingCycle: billingCycle
    });
    setShowVariantModal(false);
    navigate('/portal/cart');
  };

  return (
    <>
      <button onClick={handle} className="w-full py-3 rounded-lg font-semibold transition bg-primary text-white hover:bg-opacity-95">
        Add to Cart
      </button>

      {showVariantModal && variants.length > 0 && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-800">Select Variant</h2>
              <button onClick={() => setShowVariantModal(false)} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>
            <p className="text-gray-600 mb-4">
              Choose a variant for <strong>{product.name}</strong> ({billingCycle})
            </p>
            
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {/* Standard/Base option */}
              <button
                onClick={handleSelectBase}
                className="w-full p-3 border-2 border-gray-200 rounded-lg hover:border-primary hover:bg-primary/5 transition text-left"
              >
                <div className="font-semibold text-gray-800">Standard</div>
                <div className="text-sm text-gray-600">Base product - No additional cost</div>
                <div className="text-primary font-bold mt-1">${currentPrice.toFixed(2)}</div>
              </button>

              {/* Variant options */}
              {variants.map((variant) => {
                const additionalBase = parseFloat(variant.additional_price) || 0;
                const additional = additionalBase * multiplier;
                const base = currentPrice;
                
                return (
                  <button
                    key={variant.id}
                    onClick={() => handleSelectVariant(variant)}
                    className="w-full p-3 border-2 border-gray-200 rounded-lg hover:border-primary hover:bg-primary/5 transition text-left"
                  >
                    <div className="font-semibold text-gray-800">{variant.name}</div>
                    {variant.description && <div className="text-sm text-gray-600">{variant.description}</div>}
                    <div className="text-primary font-bold mt-1">
                      ${(base + additional).toFixed(2)}
                      {additional > 0 && (
                        <span className="text-xs text-gray-600 ml-2">(+${additional.toFixed(2)})</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}