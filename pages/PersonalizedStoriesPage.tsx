

import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { usePublicData } from '../hooks/publicQueries';
import { useProduct } from '../contexts/ProductContext';
import SkeletonCard from '../components/ui/SkeletonCard';
import { ArrowLeft, CheckCircle, Star, BookHeart, Puzzle } from 'lucide-react';
import type { PersonalizedProduct } from '../lib/database.types';
import type { Prices } from '../contexts/ProductContext';

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

const ProductCard: React.FC<{ product: PersonalizedProduct, price: number | null, featured?: boolean }> = ({ product, price, featured = false }) => {
    const [imageLoaded, setImageLoaded] = useState(false);

    const cardClass = featured 
        ? "w-80 flex-shrink-0 bg-white rounded-2xl shadow-lg overflow-hidden flex flex-col transform hover:-translate-y-2 transition-transform duration-300 border"
        : "bg-white rounded-2xl shadow-lg overflow-hidden flex flex-col transform hover:-translate-y-2 transition-transform duration-300 border";

    return (
        <div className={cardClass}>
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

  const { featuredProducts, coreProducts, addonProducts } = useMemo(() => {
    const sortedProducts = [...personalizedProducts].sort((a, b) => (a.sort_order || 99) - (b.sort_order || 99));
    
    const featured = sortedProducts.filter(p => p.sort_order && p.sort_order <= 2);
    const core = sortedProducts.filter(p => ['custom_story', 'gift_box'].includes(p.key));
    const addons = sortedProducts.filter(p => !['custom_story', 'gift_box'].includes(p.key));
    
    return { featuredProducts: featured, coreProducts: core, addonProducts: addons };
  }, [personalizedProducts]);

  const showLoadingState = isLoading || pricesLoading;

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

            {/* Featured Products Section */}
            {(showLoadingState || featuredProducts.length > 0) && (
                <section className="mb-20">
                    <h2 className="text-3xl font-bold text-gray-800 mb-8 flex items-center gap-3"><Star className="text-yellow-400" /> المنتجات المميزة</h2>
                    <div className="flex gap-8 pb-4 -mx-4 px-4 overflow-x-auto">
                        {showLoadingState ? (
                            Array.from({ length: 2 }).map((_, index) => <div className="w-80 flex-shrink-0" key={index}><SkeletonCard /></div>)
                        ) : (
                            featuredProducts.map(product => (
                                <ProductCard key={`featured-${product.id}`} product={product} price={getPrice(product.key, prices)} featured />
                            ))
                        )}
                    </div>
                </section>
            )}

            {/* Core Products */}
            {(showLoadingState || coreProducts.length > 0) && (
                <section className="mb-20">
                    <h2 className="text-3xl font-bold text-gray-800 mb-8 flex items-center gap-3"><BookHeart className="text-pink-500" /> القصص الأساسية</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {showLoadingState && !featuredProducts.length ? (
                            Array.from({ length: 2 }).map((_, index) => <SkeletonCard key={`core-skel-${index}`} />)
                        ) : (
                            coreProducts.map(product => (
                                <ProductCard key={`core-${product.id}`} product={product} price={getPrice(product.key, prices)} />
                            ))
                        )}
                    </div>
                </section>
            )}

            {/* Addon Products */}
            {(showLoadingState || addonProducts.length > 0) && (
                <section>
                    <h2 className="text-3xl font-bold text-gray-800 mb-8 flex items-center gap-3"><Puzzle className="text-green-500" /> إضافات إبداعية</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {showLoadingState && !featuredProducts.length && !coreProducts.length ? (
                             Array.from({ length: 1 }).map((_, index) => <SkeletonCard key={`addon-skel-${index}`} />)
                        ) : (
                            addonProducts.map(product => (
                                <ProductCard key={`addon-${product.id}`} product={product} price={getPrice(product.key, prices)} />
                            ))
                        )}
                    </div>
                </section>
            )}
        </div>
    </div>
  );
};

export default PersonalizedStoriesPage;