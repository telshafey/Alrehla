
import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { usePublicData } from '../hooks/queries/public/usePublicDataQuery';
import { ProductCardSkeleton } from '../components/ui/Skeletons';
import { ArrowLeft, CheckCircle, Star, BookHeart, Puzzle, Gift, Library, User, Sparkles, BookOpen } from 'lucide-react';
import type { PersonalizedProduct } from '../lib/database.types';
import { Button } from '../components/ui/Button';
import ErrorState from '../components/ui/ErrorState';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { cn } from '../lib/utils';
import Accordion from '../components/ui/Accordion';
import Image from '../components/ui/Image';
import { Tabs, TabsTrigger, TabsContent } from '../components/ui/Tabs';

interface ProductCardProps {
    product: PersonalizedProduct;
    featured?: boolean;
    minSubscriptionPrice?: number;
}

const ProductCard = React.memo(React.forwardRef<HTMLElement, ProductCardProps>(({ product, featured = false, minSubscriptionPrice = 0 }, ref) => {
    const isSubscription = product.key === 'subscription_box';
    const orderLink = isSubscription ? '/enha-lak/subscription' : `/enha-lak/order/${product.key}`;
    const buttonText = isSubscription ? 'اشترك الآن' : 'اطلب الآن';
    const isLibraryBook = product.product_type === 'library_book';

    return (
        <Card ref={ref} className={cn(
            "flex flex-col transform hover:-translate-y-2 transition-transform duration-300 h-full border-2 hover:border-primary/20",
            featured ? "w-80 flex-shrink-0" : ""
        )}>
            <div className="h-64 w-full overflow-hidden relative bg-gray-50">
                <Image 
                    src={product.image_url || 'https://i.ibb.co/RzJzQhL/hero-image-new.jpg'} 
                    alt={product.title} 
                    className="w-full h-full transition-transform duration-500 hover:scale-110"
                    objectFit="contain"
                />
                 {isLibraryBook && (
                    <div className="absolute top-3 right-3 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md z-10 flex items-center gap-1">
                        <Library size={12} /> غلاف مخصص
                    </div>
                )}
                {product.product_type === 'hero_story' && !isSubscription && (
                    <div className="absolute top-3 right-3 bg-pink-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md z-10 flex items-center gap-1">
                       <User size={12} /> بطل القصة
                    </div>
                )}
            </div>
            <CardHeader>
                <CardTitle className="text-xl">{product.title}</CardTitle>
                <CardDescription className="min-h-[3.5rem] flex flex-col justify-end mt-2">
                    {isSubscription ? (
                        <>
                            <span className="text-lg font-bold text-foreground">باقات متنوعة</span>
                            <span className="text-sm text-muted-foreground block">
                                {minSubscriptionPrice > 0 ? `تبدأ من ${minSubscriptionPrice} ج.م/شهرياً` : 'باقات متعددة'}
                            </span>
                        </>
                    ) : product.has_printed_version && product.price_printed ? (
                         <div className="flex items-baseline gap-1">
                            <span className="text-2xl font-extrabold text-foreground">{product.price_printed}</span>
                            <span className="text-sm font-medium text-muted-foreground">ج.م</span>
                            {product.price_electronic && <span className="text-xs text-muted-foreground mr-2 font-normal">(أو {product.price_electronic} إلكتروني)</span>}
                        </div>
                    ) : product.price_electronic ? (
                         <div className="flex items-baseline gap-1">
                            <span className="text-2xl font-extrabold text-foreground">{product.price_electronic}</span>
                            <span className="text-sm font-medium text-muted-foreground">ج.م</span>
                        </div>
                    ) : null}
                </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col flex-grow">
                <p className="text-muted-foreground text-sm flex-grow line-clamp-3 mb-4 leading-relaxed">{product.description}</p>
                {product.features && product.features.length > 0 && (
                     <Accordion title="عرض الميزات" className="mt-auto border-t pt-2">
                         <ul className="mt-2 space-y-2 text-sm p-1">
                            {product.features.map(feature => (
                                <li key={feature} className="flex items-start gap-2">
                                    <CheckCircle size={14} className="text-green-500 flex-shrink-0 mt-0.5" />
                                    <span className="text-muted-foreground text-xs">{feature}</span>
                                </li>
                            ))}
                        </ul>
                     </Accordion>
                )}
            </CardContent>
            <CardFooter className="mt-auto pt-0 pb-6">
                {product.is_addon ? (
                     <div className="relative group w-full">
                        <Button variant="secondary" className="w-full cursor-not-allowed bg-gray-100 text-gray-400">
                            <span>يُضاف في سلة الشراء</span>
                        </Button>
                        <div className="absolute bottom-full mb-2 w-full hidden group-hover:block bg-popover text-popover-foreground text-xs rounded py-1 px-2 text-center z-10 shadow-md">
                            هذا المنتج هو إضافة ولا يمكن طلبه منفرداً.
                        </div>
                    </div>
                ) : (
                    <Button as={Link} to={orderLink} variant={isLibraryBook ? "default" : "pink"} className="w-full shadow-sm hover:shadow-md transition-all">
                        <span>{buttonText}</span>
                        <ArrowLeft className="transform rotate-180" size={18} />
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
  const subscriptionPlans = data?.subscriptionPlans || [];
  
  const [activeTab, setActiveTab] = useState('hero');

  // Calculate the minimum subscription price dynamically
  const lowestSubscriptionPrice = useMemo(() => {
      if (!subscriptionPlans.length) return 0;
      return Math.min(...subscriptionPlans.map(plan => plan.price_per_month));
  }, [subscriptionPlans]);

  const { subscriptionProduct, otherHeroStories, libraryBooks, addonProducts } = useMemo(() => {
    const sortedProducts = [...personalizedProducts].sort((a, b) => (a.sort_order || 99) - (b.sort_order || 99));
    
    // 1. Subscription Box (Special handling)
    const sub = sortedProducts.find(p => p.key === 'subscription_box');
    
    // 2. Hero Stories (Exclude sub box and addons)
    const hero = sortedProducts.filter(p => !p.is_addon && p.key !== 'subscription_box' && (p.product_type === 'hero_story' || !p.product_type));
    
    // 3. Library Books
    const library = sortedProducts.filter(p => !p.is_addon && p.product_type === 'library_book');
    
    // 4. Addons
    const addons = sortedProducts.filter(p => p.is_addon);
    
    return { subscriptionProduct: sub, otherHeroStories: hero, libraryBooks: library, addonProducts: addons };
  }, [personalizedProducts]);
  
  return (
    <div className="bg-muted/30 py-12 sm:py-16 animate-fadeIn min-h-screen">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            
            {/* Header */}
            <div className="text-center mb-12">
                <h1 className="text-4xl sm:text-5xl font-extrabold text-foreground">المتجر</h1>
                <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
                    كل ما يحتاجه طفلك من قصص ملهمة وكتب نافعة في مكان واحد
                </p>
            </div>
            
            {error ? <ErrorState message={(error as Error).message} onRetry={refetch} /> : (
            <>
                 <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-12 w-full">
                    
                    {/* 
                       Full Width Split Grid Buttons 
                       REPLACED TabsList with standard grid div to eliminate scrolling 
                    */}
                    <div className="grid w-full grid-cols-2 gap-4 sm:gap-6 mb-10" role="tablist">
                        <TabsTrigger 
                            value="hero" 
                            className="h-16 sm:h-20 w-full rounded-2xl border-2 border-pink-200 bg-white text-gray-600 text-lg sm:text-xl font-bold shadow-sm transition-all hover:border-pink-400 hover:text-pink-600 data-[state=active]:bg-pink-600 data-[state=active]:text-white data-[state=active]:border-pink-600 data-[state=active]:shadow-lg data-[state=active]:scale-[1.02] flex items-center justify-center gap-3"
                        >
                            <User className="w-6 h-6 sm:w-8 sm:h-8" />
                            <span>أنت البطل هنا</span>
                        </TabsTrigger>

                        <TabsTrigger 
                            value="library" 
                            className="h-16 sm:h-20 w-full rounded-2xl border-2 border-blue-200 bg-white text-gray-600 text-lg sm:text-xl font-bold shadow-sm transition-all hover:border-blue-400 hover:text-blue-600 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:border-blue-600 data-[state=active]:shadow-lg data-[state=active]:scale-[1.02] flex items-center justify-center gap-3"
                        >
                            <Library className="w-6 h-6 sm:w-8 sm:h-8" />
                            <span>المكتبة العامة</span>
                        </TabsTrigger>
                    </div>

                    <TabsContent value="hero" className="animate-fadeIn space-y-12 w-full">
                         {/* 1. Subscription Banner (Only in Hero Tab) */}
                        <section className="bg-gradient-to-r from-pink-500 to-rose-500 p-8 sm:p-10 rounded-3xl shadow-xl text-white relative overflow-hidden">
                             <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
                             <div className="absolute bottom-0 left-0 w-40 h-40 bg-yellow-400/20 rounded-full -ml-10 -mb-10 blur-2xl"></div>
                             
                            <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
                                <div className="flex items-start gap-6">
                                    <div className="bg-white/20 p-4 rounded-2xl backdrop-blur-sm shadow-inner hidden sm:block">
                                        <Gift size={48} className="text-yellow-300" />
                                    </div>
                                    <div>
                                        <h2 className="text-3xl font-extrabold mb-2 flex items-center gap-2">
                                            {subscriptionProduct?.title || content?.subscriptionBannerTitle}
                                            <Sparkles className="text-yellow-300 animate-pulse" />
                                        </h2>
                                        <p className="text-pink-100 text-lg max-w-xl leading-relaxed">
                                            {subscriptionProduct?.description || "هدية متجددة من الخيال تصل باب منزلك كل شهر."}
                                        </p>
                                        <div className="mt-4 flex flex-wrap gap-3">
                                            {subscriptionProduct?.features?.slice(0,3).map(f => (
                                                <span key={f} className="text-xs font-bold bg-black/20 px-3 py-1 rounded-full flex items-center gap-1">
                                                    <CheckCircle size={12} /> {f}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex flex-col items-center gap-2 min-w-[200px]">
                                     <div className="text-center mb-2">
                                        <span className="block text-sm text-pink-100 opacity-90">تبدأ من</span>
                                        <span className="text-3xl font-black text-white">{lowestSubscriptionPrice} ج.م</span>
                                        <span className="text-sm"> / شهرياً</span>
                                     </div>
                                     <Button as={Link} to="/enha-lak/subscription" variant="secondary" size="lg" className="w-full font-bold shadow-lg hover:scale-105 transition-transform text-pink-600">
                                        اشترك الآن
                                    </Button>
                                </div>
                            </div>
                        </section>

                        {/* 2. Hero Products Grid */}
                        <div>
                            <div className="flex items-center gap-3 mb-8">
                                <div className="p-2 bg-pink-100 text-pink-600 rounded-lg"><Star size={24}/></div>
                                <h2 className="text-2xl font-bold text-gray-800">قصص أبطالها أطفالكم</h2>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 auto-rows-fr">
                                {isLoading ? (
                                    Array.from({ length: 3 }).map((_, index) => <ProductCardSkeleton key={`hero-skel-${index}`} />)
                                ) : (
                                    otherHeroStories.length > 0 ? otherHeroStories.map(product => (
                                        <ProductCard 
                                            key={`hero-${product.id}`} 
                                            product={product}
                                        />
                                    )) : <div className="col-span-full text-center py-12 bg-white rounded-xl border border-dashed text-muted-foreground">لا توجد قصص في هذا القسم حالياً.</div>
                                )}
                            </div>
                        </div>

                         {/* 3. Addon Products - ONLY in Hero Tab */}
                        {addonProducts.length > 0 && (
                            <section className="mt-12 border-t pt-10">
                                <div className="text-center mb-10">
                                    <h2 className="text-3xl font-bold text-foreground flex items-center justify-center gap-3">
                                        <Puzzle className="text-green-500" /> {content?.addonProductsTitle}
                                    </h2>
                                    <p className="text-muted-foreground mt-2">منتجات ممتعة يمكن إضافتها لطلبك لتكتمل الهدية</p>
                                </div>
                            
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 auto-rows-fr">
                                    {isLoading ? (
                                        Array.from({ length: 2 }).map((_, index) => <ProductCardSkeleton key={`addon-skel-${index}`} />)
                                    ) : (
                                        addonProducts.map(product => (
                                            <ProductCard 
                                                key={`addon-${product.id}`} 
                                                product={product} 
                                            />
                                        ))
                                    )}
                                </div>
                            </section>
                        )}
                    </TabsContent>

                    <TabsContent value="library" className="animate-fadeIn w-full">
                         {/* Library Products */}
                         <div className="flex items-center gap-3 mb-8 justify-center sm:justify-start">
                            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg"><BookHeart size={24}/></div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-800">المكتبة العامة للنشء</h2>
                                <p className="text-sm text-muted-foreground">مجموعة مختارة من الكتب النافعة والقصص الملهمة للأطفال والشباب، مع إمكانية تخصيص الغلاف.</p>
                            </div>
                        </div>

                         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 auto-rows-fr">
                            {isLoading ? (
                                Array.from({ length: 3 }).map((_, index) => <ProductCardSkeleton key={`lib-skel-${index}`} />)
                            ) : (
                                libraryBooks.length > 0 ? libraryBooks.map(product => (
                                    <ProductCard 
                                        key={`lib-${product.id}`} 
                                        product={product}
                                    />
                                )) : <div className="col-span-full text-center py-12 bg-white rounded-xl border border-dashed text-muted-foreground">لا توجد كتب في المكتبة حالياً.</div>
                            )}
                        </div>
                    </TabsContent>
                </Tabs>
            </>
            )}
        </div>
    </div>
  );
};

export default PersonalizedStoriesPage;
