import React, { useState, useMemo } from 'react';
import { usePublicData } from '../hooks/queries/public/usePublicDataQuery';
import { useCart } from '../contexts/CartContext';
import { useToast } from '../contexts/ToastContext';
import PageLoader from '../components/ui/PageLoader';
import { Sparkles, ArrowLeft } from 'lucide-react';
import { ServiceCard } from '../components/creative-writing/services/ServiceCard';
import { ServiceOrderModal } from '../components/creative-writing/services/ServiceOrderModal';
import type { StandaloneService } from '../lib/database.types';
import { Link } from 'react-router-dom';

const CreativeWritingServicesPage: React.FC = () => {
    const { data, isLoading } = usePublicData();
    const { addItemToCart } = useCart();
    const { addToast } = useToast();
    
    const [modalService, setModalService] = useState<StandaloneService | null>(null);

    const services = (data as any)?.standaloneServices || [];
    
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

    const handleAddToCart = (service: StandaloneService) => {
        if (service.requires_file_upload) {
            setModalService(service);
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
                    },
                },
            });
            addToast(`تمت إضافة "${service.name}" إلى السلة بنجاح!`, 'success');
        }
    };

    const handleModalConfirm = (service: StandaloneService, file: File, notes: string) => {
        addItemToCart({
            type: 'order',
            payload: {
                productKey: `service_${service.id}`,
                summary: `خدمة: ${service.name}`,
                totalPrice: service.price,
                // The actual file object is passed here to be handled by the checkout mutation.
                // Note: This works because our cart is in-memory/session-storage for the session.
                // A backend-based cart would require uploading the file first.
                files: { service_file: file },
                details: {
                    serviceId: service.id,
                    serviceName: service.name,
                    userNotes: notes,
                    fileName: file.name,
                },
            },
        });
        addToast(`تمت إضافة "${service.name}" إلى السلة بنجاح!`, 'success');
        setModalService(null);
    };

    if (isLoading) {
        return <PageLoader text="جاري تحميل الخدمات..." />;
    }

    return (
        <>
            <ServiceOrderModal
                isOpen={!!modalService}
                onClose={() => setModalService(null)}
                service={modalService}
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
                                {/* FIX: Cast categoryServices to an array of StandaloneService to resolve type inference issue. */}
                                {(categoryServices as StandaloneService[]).map(service => (
                                    <ServiceCard 
                                        key={service.id} 
                                        service={service} 
                                        onAddToCart={() => handleAddToCart(service)} 
                                    />
                                ))}
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