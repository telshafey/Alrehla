import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { usePublicData } from '../hooks/queries.ts';
import { useProduct } from '../contexts/ProductContext.tsx';
import PageLoader from '../components/ui/PageLoader.tsx';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import type { PersonalizedProduct } from '../lib/database.types.ts';
import type { Prices } from '../contexts/ProductContext.tsx';

const getPrice = (key: string, prices: Prices | null): number | null => {
    if (!prices) return null;
    switch (key) {
        case 'custom_story': return prices.story.printed;
        case 'coloring_book': return prices.coloringBook;
        case 'dua_booklet': return prices.duaBooklet;
        case 'gift_box': return prices.giftBox;
        default: return null;
    }
};

const ProductCard: React.FC<{ product: PersonalizedProduct, price: number | null }> = ({ product, price }) => {
    const [imageLoaded, setImageLoaded] = useState(false);

    return (
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden flex flex-col transform hover:-translate-y-2 transition-transform duration-300 border">
            <div className="relative h-64 bg-gray-100">
                 {!imageLoaded && <div className="absolute inset-0 bg-gray-200 animate-pulse"></div>}
                <img 
                    src={product.image_url || 'https://i.ibb.co/RzJzQhL/hero-image-new.jpg'} 
                    alt={product.title} 
                    className={`w-full h-full object-cover transition-opacity duration-500 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                    loading="lazy"
                    onLoad={() => setImageLoaded(true)}
                />
            </div>
            <div className="p-6 flex flex-col flex-grow">
                <h3 className="text-2xl font-bold text-gray-800">{product.title}</h3>
                 {price !== null && 
                    <p className="mt-2 text-3xl font-extrabold text-gray-800">{price} <span className="text-lg font-medium text-gray-500">ج.م</span></p>
                }
                <p className="mt-2 text-gray-600 text-sm flex-grow">{product.description}</p>
                {product.features && product.features.length > 0 && (
                     <ul className="mt-4 space-y-2 text-sm">
                        {product.features.map(feature => (
                            <li key={feature} className="flex items-center gap-2">
                                <CheckCircle size={16} className="text-green-500" />
                                <span>{feature}</span>
                            </li>
                        ))}
                    </ul>
                )}
                <Link 
                    to={`/enha-lak/order/${product.key}`} 
                    className="mt-6 w-full bg-pink-600 text-white font-bold py-3 px-4 rounded-full hover:bg-pink-700 transition-colors text-center inline-flex items-center justify-center gap-2"
                >
                    <span>اطلب الآن</span>
                    <ArrowLeft className="transform rotate-180" />
                </Link>
            </div>
        </div>
    );
};


const PersonalizedStoriesPage: React.FC = () => {
  const { data, isLoading, error } = usePublicData();
  const { prices, loading: pricesLoading } = useProduct();
  const personalizedProducts = data?.personalizedProducts || [];

  if (isLoading || pricesLoading) {
      return <PageLoader text="جاري تحميل المنتجات..." />;
  }

  if (error) {
      return <div className="text-center text-red-500 py-12">{error.message}</div>;
  }
  
  return (
    <div className="bg-gray-50 py-16 sm:py-20 animate-fadeIn">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
                <h1 className="text-4xl sm:text-5xl font-extrabold text-pink-600">متجر "إنها لك"</h1>
                <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-600">
                    اختر الكنز الذي سيجعل طفلك بطلاً. كل منتج مصمم بحب ليقدم تجربة فريدة لا تُنسى.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {personalizedProducts
                    .sort((a, b) => (a.sort_order || 99) - (b.sort_order || 99))
                    .map(product => (
                        <ProductCard key={product.id} product={product} price={getPrice(product.key, prices)} />
                ))}
            </div>
        </div>
    </div>
  );
};

export default PersonalizedStoriesPage;