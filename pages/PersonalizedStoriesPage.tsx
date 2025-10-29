import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { usePublicData } from '../hooks/queries/public/usePublicDataQuery';
import SkeletonCard from '../components/ui/SkeletonCard';
import { ArrowLeft, CheckCircle, Star, BookHeart, Puzzle, Gift } from 'lucide-react';
import type { PersonalizedProduct } from '../lib/database.types';
import { Button } from '../components/ui/Button';
import ErrorState from '../components/ui/ErrorState';

const ProductCard: React.FC<{ product: PersonalizedProduct, featured?: boolean }> = ({ product, featured = false }) => {
    const [imageLoaded, setImageLoaded] = useState(false);

    const cardClass = featured 
        ? "w-80 flex-shrink-0 bg-white rounded-2xl shadow-lg overflow-hidden flex flex-col transform hover:-translate-y-2 transition-transform duration-300 border"
        : "bg-white rounded-2xl shadow-lg overflow-hidden flex flex-col transform hover:-translate-y-2 transition-transform duration-300 border";

    const isSubscription = product.key === 'subscription_box';
    const orderLink = isSubscription ? '/enha-lak/subscription' : `/enha-lak/order/${product.key}`;
    const buttonText = isSubscription ? 'اشترك الآن' : 'اطلب الآن';

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
                 
                {isSubscription ? (
                    <div>
                        <p className="mt-2 text-xl font-bold text-gray-800">باقات متنوعة</p>
                        <p className="text-sm text-gray-500">تبدأ من 283 ج.م/شهرياً</p>
                    </div>
                ) : product.has_printed_version && product.price_printed ? (
                     <div>
                        <p className="mt-2 text-3xl font-extrabold text-gray-800">{product.price_printed} <span className="text-lg font-medium text-gray-500">ج.م</span></p>
                        {product.price_electronic && <p className="text-sm text-gray-500">(أو {product.price_electronic} ج.م للإلكترونية)</p>}
                    </div>
                ) : product.price_electronic ? (
                     <div>
                        <p className="mt-2 text-3xl font-extrabold text-gray-800">{product.price_electronic} <span className="text-lg font-medium text-gray-500">ج.م</span></p>
                        <p className="text-sm text-gray-500">للنسخة الإلكترونية</p>
                    </div>
                ) : null}

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
                {product.is_addon ? (
                     <div className="relative group mt-6">
                        <div className="w-full bg-gray-200 text-gray-500 font-bold py-3 px-4 rounded-full text-center inline-flex items-center justify-center gap-2 cursor-not-allowed">
                            <span>يُضاف مع الطلب</span>
                        </div>
                        <div className="absolute bottom-full mb-2 w-full hidden group-hover:block bg-gray-700 text-white text-xs rounded py-1 px-2 text-center z-10">
                            هذا المنتج هو إضافة ولا يمكن طلبه منفرداً.
                        </div>
                    </div>
                ) : (
                    <Link 
                        to={orderLink} 
                        className="mt-6 w-full bg-pink-600 text-white font-bold py-3 px-4 rounded-full hover:bg-pink-700 transition-colors text-center inline-flex items-center justify-center gap-2"
                    >
                        <span>{buttonText}</span>
                        <ArrowLeft className="transform rotate-180" />
                    </Link>
                )}
            </div>
        </div>
    );
};


const PersonalizedStoriesPage: React.FC = () => {
  const { data, isLoading, error, refetch } = usePublicData();
  const content = data?.siteContent?.enhaLakPage.store;
  const personalizedProducts = data?.personalizedProducts || [];

  const { featuredProducts, coreProducts, addonProducts } = useMemo(() => {
    const sortedProducts = [...personalizedProducts].sort((a, b) => (a.sort_order || 99) - (b.sort_order || 99));
    
    const featured = sortedProducts.filter(p => p.is_featured);
    const core = sortedProducts.filter(p => !p.is_featured && !p.is_addon);
    const addons = sortedProducts.filter(p => p.is_addon);
    
    return { featuredProducts: featured, coreProducts: core, addonProducts: addons };
  }, [personalizedProducts]);
  
  return (
    <div className="bg-gray-50 py-16 sm:py-20 animate-fadeIn">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
                <h1 className="text-4xl sm:text-5xl font-extrabold text-pink-600">{content?.heroTitle}</h1>
                <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-600">
                    {content?.heroSubtitle}
                </p>
            </div>
            
             {/* Subscription Banner */}
            <section className="mb-16 bg-gradient-to-r from-yellow-400 to-orange-500 p-8 rounded-2xl shadow-lg text-white">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <Gift size={48} />
                        <div>
                            <h2 className="text-2xl font-extrabold">{content?.subscriptionBannerTitle}</h2>
                            <p className="text-yellow-100">هدية متجددة من الخيال تصل باب منزلك كل شهر.</p>
                        </div>
                    </div>
                    <Button asChild variant="outline" className="bg-white text-orange-600 font-bold border-transparent hover:bg-yellow-50">
                        <Link to="/enha-lak/subscription">
                            اشترك الآن
                        </Link>
                    </Button>
                </div>
            </section>

            {error ? <ErrorState message={(error as Error).message} onRetry={refetch} /> : (
            <>
                {/* Featured Products Section */}
                {(isLoading || featuredProducts.length > 0) && (
                    <section className="mb-20">
                        <h2 className="text-3xl font-bold text-gray-800 mb-8 flex items-center gap-3"><Star className="text-yellow-400" /> المنتجات المميزة</h2>
                        <div className="flex gap-8 pb-4 -mx-4 px-4 overflow-x-auto">
                            {isLoading ? (
                                Array.from({ length: 2 }).map((_, index) => <div className="w-80 flex-shrink-0" key={index}><SkeletonCard /></div>)
                            ) : (
                                featuredProducts.map(product => (
                                    <ProductCard key={`featured-${product.id}`} product={product} featured />
                                ))
                            )}
                        </div>
                    </section>
                )}

                {/* Core Products */}
                {(isLoading || coreProducts.length > 0) && (
                    <section className="mb-20">
                        <h2 className="text-3xl font-bold text-gray-800 mb-8 flex items-center gap-3"><BookHeart className="text-pink-500" /> المنتجات الأساسية</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {isLoading && !featuredProducts.length ? (
                                Array.from({ length: 2 }).map((_, index) => <SkeletonCard key={`core-skel-${index}`} />)
                            ) : (
                                coreProducts.map(product => (
                                    <ProductCard key={`core-${product.id}`} product={product} />
                                ))
                            )}
                        </div>
                    </section>
                )}

                {/* Addon Products */}
                {(isLoading || addonProducts.length > 0) && (
                    <section>
                        <h2 className="text-3xl font-bold text-gray-800 mb-8 flex items-center gap-3"><Puzzle className="text-green-500" /> إضافات إبداعية</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {isLoading && !featuredProducts.length && !coreProducts.length ? (
                                 Array.from({ length: 1 }).map((_, index) => <SkeletonCard key={`addon-skel-${index}`} />)
                            ) : (
                                addonProducts.map(product => (
                                    <ProductCard key={`addon-${product.id}`} product={product} />
                                ))
                            )}
                        </div>
                    </section>
                )}
            </>
            )}
        </div>
    </div>
  );
};

export default PersonalizedStoriesPage;