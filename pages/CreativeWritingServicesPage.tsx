import React, { useState, useMemo } from 'react';
import { usePublicData } from '../hooks/queries/public/usePublicDataQuery';
import { useCart } from '../contexts/CartContext';
import { useToast } from '../contexts/ToastContext';
import PageLoader from '../components/ui/PageLoader';
import { Sparkles, ArrowLeft } from 'lucide-react';
import { ServiceCard } from '../components/creative-writing/services/ServiceCard';
import { ServiceOrderModal } from '../components/creative-writing/services/ServiceOrderModal';
import { ServiceProvidersModal } from '../components/creative-writing/services/ServiceProvidersModal';
import type { StandaloneService, Instructor } from '../lib/database.types';
import { Link } from 'react-router-dom';

const CreativeWritingServicesPage: React.FC = () => {
    const { data, isLoading } = usePublicData();
    const { addItemToCart } = useCart();
    const { addToast } = useToast();
    
    const [orderModalService, setOrderModalService] = useState<StandaloneService | null>(null);
    const [providerModalService, setProviderModalService] = useState<StandaloneService | null>(null);

    const services = data?.standaloneServices || [];
    const instructors = data?.instructors || [];
    
    const servicesByCategory = useMemo(() => {
        return (services as StandaloneService[]).reduce((acc, service) => {
            const { category } = service;
            if (!acc[category]) {
                acc[category] = [];
            }
            acc[category].push(service);
            return acc;
        }, {} as Record<string, StandaloneService[]>);
    }, [services]);

    const getPriceRange = (service: StandaloneService) => {
        if (service.provider_type !== 'instructor' || !instructors) {
            return { min: service.price, max: service.price };
        }
        const prices = instructors
            .map((i: Instructor) => i.service_rates?.[service.id])
            .filter((price): price is number => price !== undefined && price !== null);

        if (prices.length === 0) {
            return { min: service.price, max: service.price }; // Fallback to base price
        }
        return { min: Math.min(...prices), max: Math.max(...prices) };
    };

    const handleServiceSelection = (service: StandaloneService) => {
        setProviderModalService(service);
    };

    const handleProviderSelection = (service: StandaloneService, instructor: Instructor) => {
        setProviderModalService(null);

        const price = instructor.service_rates?.[service.id] ?? service.price;

        if (service.requires_file_upload) {
            // Pass instructor and final price to the next modal via the service object
            const serviceWithContext = { ...service, selectedInstructor: instructor, finalPrice: price };
            setOrderModalService(serviceWithContext);
        } else {
            addItemToCart({
                type: 'order', // Using a generic order type for services
                payload: {
                    productKey: `service_${service.id}`,
                    summary: `خدمة: ${service.name} (مع ${instructor.name})`,
                    totalPrice: price,
                    details: {
                        serviceId: service.id,
                        serviceName: service.name,
                        assigned_instructor_id: instructor.id,
                    },
                },
            });
            addToast(`تمت إضافة "${service.name}" إلى السلة بنجاح!`, 'success');
        }
    };

    const handleOrderCompanyService = (service: StandaloneService) => {
        if (service.requires_file_upload) {
            setOrderModalService(service);
        } else {
            addItemToCart({
                type: 'order',
                payload: {
                    productKey: `service_${service.id}`,
                    summary: `خدمة: ${service.name}`,
                    totalPrice: service.price,
                    details: {
                        serviceId: service.id,
                        serviceName: service.name,
                        assigned_instructor_id: null, // Company service
                    },
                },
            });
            addToast(`تمت إضافة "${service.name}" إلى السلة بنجاح!`, 'success');
        }
    };
    
    const handleModalConfirm = (service: StandaloneService, file: File, notes: string) => {
        const { selectedInstructor, finalPrice } = service as any;
        const isCompanyService = !selectedInstructor;

        addItemToCart({
            type: 'order',
            payload: {
                productKey: `service_${service.id}`,
                summary: isCompanyService ? `خدمة: ${service.name}` : `خدمة: ${service.name} (مع ${selectedInstructor.name})`,
                totalPrice: isCompanyService ? service.price : finalPrice,
                files: { service_file: file },
                details: {
                    serviceId: service.id,
                    serviceName: service.name,
                    userNotes: notes,
                    fileName: file.name,
                    assigned_instructor_id: isCompanyService ? null : selectedInstructor.id,
                },
            },
        });
        addToast(`تمت إضافة "${service.name}" إلى السلة بنجاح!`, 'success');
        setOrderModalService(null);
    };

    if (isLoading) {
        return <PageLoader text="جاري تحميل الخدمات..." />;
    }

    return (
        <>
            <ServiceProvidersModal
                isOpen={!!providerModalService}
                onClose={() => setProviderModalService(null)}
                service={providerModalService}
                onSelect={handleProviderSelection}
            />
            <ServiceOrderModal
                isOpen={!!orderModalService}
                onClose={() => setOrderModalService(null)}
                service={orderModalService}
                onConfirm={handleModalConfirm}
            />
            <div className="bg-gray-50 py-16 sm:py-20 animate-fadeIn">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h1 className="text-4xl sm:text-5xl font-extrabold text-blue-600 flex items-center justify-center gap-3">
                            <Sparkles />
                            الخدمات الإبداعية
                        </h1>
                        <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-600">
                            خدمات مصممة خصيصاً لدعم رحلة طفلك الإبداعية في كل خطوة، سواء كان مشتركاً في برامجنا أم لا.
                        </p>
                    </div>
                    
                    {Object.entries(servicesByCategory).map(([category, categoryServices]) => (
                        <section key={category} className="mb-16">
                            <h2 className="text-3xl font-bold text-gray-800 mb-8 border-r-4 border-blue-500 pr-4">
                                {category}
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {(categoryServices as StandaloneService[]).map(service => {
                                    const { min, max } = getPriceRange(service);
                                    return (
                                        <ServiceCard 
                                            key={service.id} 
                                            service={service} 
                                            minPrice={min}
                                            maxPrice={max}
                                            onViewProviders={() => handleServiceSelection(service)}
                                            onOrderNow={() => handleOrderCompanyService(service)}
                                        />
                                    )
                                })}
                            </div>
                        </section>
                    ))}

                    <div className="mt-16 text-center">
                        <Link to="/creative-writing" className="inline-flex items-center font-semibold text-lg text-blue-600 hover:text-blue-800 group">
                            <ArrowLeft size={22} className="ms-2 transition-transform group-hover:-translate-x-1 rtl:group-hover:translate-x-1" />
                            <span>العودة إلى صفحة "بداية الرحلة"</span>
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
};

export default CreativeWritingServicesPage;