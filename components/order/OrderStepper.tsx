import React from 'react';

interface OrderStepperProps {
    steps: { key: string; title: string }[];
    currentStep: string;
}

const OrderStepper: React.FC<OrderStepperProps> = ({ steps, currentStep }) => {
    const currentStepIndex = steps.findIndex(s => s.key === currentStep);

    return (
        <nav aria-label="Progress">
            <ol role="list" className="space-y-4 md:flex md:space-y-0 md:space-x-8 rtl:md:space-x-reverse">
                {steps.map((step, stepIdx) => (
                    <li key={step.title} className="md:flex-1">
                        {stepIdx < currentStepIndex ? (
                            <div className="group flex flex-col border-l-4 rtl:border-l-0 rtl:border-r-4 border-blue-600 py-2 pl-4 rtl:pl-0 rtl:pr-4 md:border-l-0 rtl:md:border-r-0 md:border-t-4 md:pl-0 rtl:md:pr-0 md:pt-4 md:pb-0">
                                <span className="text-sm font-semibold text-blue-600">الخطوة {stepIdx + 1}</span>
                                <span className="text-sm font-medium">{step.title}</span>
                            </div>
                        ) : stepIdx === currentStepIndex ? (
                            <div className="flex flex-col border-l-4 rtl:border-l-0 rtl:border-r-4 border-blue-600 py-2 pl-4 rtl:pl-0 rtl:pr-4 md:border-l-0 rtl:md:border-r-0 md:border-t-4 md:pl-0 rtl:md:pr-0 md:pt-4 md:pb-0" aria-current="step">
                                <span className="text-sm font-semibold text-blue-600">الخطوة {stepIdx + 1}</span>
                                <span className="text-sm font-medium">{step.title}</span>
                            </div>
                        ) : (
                             <div className="group flex flex-col border-l-4 rtl:border-l-0 rtl:border-r-4 border-gray-200 py-2 pl-4 rtl:pl-0 rtl:pr-4 md:border-l-0 rtl:md:border-r-0 md:border-t-4 md:pl-0 rtl:md:pr-0 md:pt-4 md:pb-0">
                                <span className="text-sm font-semibold text-gray-500">الخطوة {stepIdx + 1}</span>
                                <span className="text-sm font-medium">{step.title}</span>
                            </div>
                        )}
                    </li>
                ))}
            </ol>
        </nav>
    );
};

export default OrderStepper;