import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { usePublicData } from '../hooks/queries/public/usePublicDataQuery';
import SkeletonCard from '../components/ui/SkeletonCard';
import { ArrowLeft, CheckCircle, Star, BookHeart, Puzzle, Gift } from 'lucide-react';
import type { PersonalizedProduct } from '../lib/database.types';
import { Button } from '../components/ui/Button';
import ErrorState from '../components/ui/ErrorState';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { cn } from '../lib/utils';
import Accordion from '../components/ui/Accordion';
import Image from '../components/ui/Image';

const ProductCard = React.memo(React.forwardRef<HTMLElement, { product: PersonalizedProduct, featured?: boolean }>(({ product, featured = false }, ref) => {
    const isSubscription = product.key === 'subscription_box';
    const orderLink = isSubscription ? '/enha-lak/subscription' : `/enha-lak/order/${product.key}`;
    const buttonText = isSubscription ? 'اشترك الآن' : 'اطلب الآن';

    return (
        <Card ref={ref} className={cn(
            "flex flex-col transform hover:-translate-y-2 transition-transform duration-300",
            featured ? "w-80 flex-shrink-0" : ""
        )}>
            <Image 
                src={product.image_url || 'https://i.ibb.co/RzJzQhL/hero-image-new.jpg'} 
                alt={product.title} 
                className="aspect-[4/3] object-cover"
            />
            <CardHeader>
                <CardTitle>{product.title}</CardTitle>
                <CardDescription className="h-16">
                    {isSubscription ? (
                        <>
                            <span className="text-xl font-bold text-foreground">باقات متنوعة</span>
                            <span className="text-sm text-muted-foreground block">تبدأ من 283 ج.م/شهرياً</span>
                        </>
                    ) : product.has_printed_version && product.price_printed ? (
                         <>
                            <span className="text-3xl font-extrabold text-foreground">{product.price_printed}</span>
                            <span className="text-lg font-medium text-muted-foreground ml-1">ج.م</span>
                            {product.price_electronic && <span className="text-sm text-muted-foreground block">(أو {product.price_electronic} ج.م للإلكترونية)</span>}
                        </>
                    ) : product.price_electronic ? (
                         <>
                            <span className="text-3xl font-extrabold text-foreground">{product.price_electronic}</span>
                            <span className="text-lg font-medium text-muted-foreground ml-1">ج.م</span>
                            <span className="text-sm text-muted-foreground block">للنسخة الإلكترونية</span>
                        </>
                    ) : null}
                </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col flex-grow">
                <p className="text-muted-foreground text-sm flex-grow">{product.description}</p>
                {product.features && product.features.length > 0 && (
                     <Accordion title="عرض الميزات">
                         <ul className="mt-4 space-y-2 text-sm p-2">
                            {product.features.map(feature => (
                                <li key={feature} className="flex items-center gap-2">
                                    <CheckCircle size={16} className="text-green-500" />
                                    <span className="text-muted-foreground">{feature}</span>
                                </li>
                            ))}
                        </ul>
                     </Accordion>
                )}
            </CardContent>
            <CardFooter>
                {product.is_addon ? (
                     <div className="relative group w-full">
                        <Button variant="secondary" className="w-full cursor-not-allowed">
                            <span>يُضاف مع الطلب</span>
                        </Button>
                        <div className="absolute bottom-full mb-2 w-full hidden group-hover:block bg-popover text-popover-foreground text-xs rounded py-1 px-2 text-center z-10 shadow-md">
                            هذا المنتج هو إضافة ولا يمكن طلبه منفرداً.
                        </div>
                    </div>
                ) : (
                    <Button as={Link} to={orderLink} variant="pink" className="w-full">
                        <span>{buttonText}</span>
                        <ArrowLeft className="transform rotate-180" />
                    </Button>
                )}
            </CardFooter>
        </Card>
    );
}));
ProductCard.displayName = "ProductCard";


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
    <div className="bg-muted/40 py-16 sm:py-20 animate-fadeIn">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
                <h1 className="text-4xl sm:text-5xl font-extrabold text-pink-600">{content?.heroTitle}</h1>
                <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
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
                    <Button as={Link} to="/enha-lak/subscription" variant="outline" className="bg-white text-orange-600 font-bold border-transparent hover:bg-yellow-50">
                        اشترك الآن
                    </Button>
                </div>
            </section>

            {error ? <ErrorState message={(error as Error).message} onRetry={refetch} /> : (
            <>
                {/* Featured Products Section */}
                <section className="mb-20">
                    <h2 className="text-3xl font-bold text-foreground mb-8 flex items-center gap-3"><Star className="text-yellow-400" /> {content?.featuredProductsTitle}</h2>
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

                {/* Core Products */}
                <section className="mb-20">
                    <h2 className="text-3xl font-bold text-foreground mb-8 flex items-center gap-3"><BookHeart className="text-pink-500" /> {content?.coreProductsTitle}</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {isLoading ? (
                            Array.from({ length: 3 }).map((_, index) => <SkeletonCard key={`core-skel-${index}`} />)
                        ) : (
                            coreProducts.map(product => (
                                <ProductCard key={`core-${product.id}`} product={product} />
                            ))
                        )}
                    </div>
                </section>

                {/* Addon Products */}
                <section>
                    <h2 className="text-3xl font-bold text-foreground mb-8 flex items-center gap-3"><Puzzle className="text-green-500" /> {content?.addonProductsTitle}</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {isLoading ? (
                             Array.from({ length: 2 }).map((_, index) => <SkeletonCard key={`addon-skel-${index}`} />)
                        ) : (
                            addonProducts.map(product => (
                                <ProductCard key={`addon-${product.id}`} product={product} />
                            ))
                        )}
                    </div>
                </section>
            </>
            )}
        </div>
    </div>
  );
};

export default PersonalizedStoriesPage;