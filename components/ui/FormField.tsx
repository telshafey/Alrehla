import React from 'react';

interface FormFieldProps {
    label: string;
    htmlFor: string;
    error?: string;
    children: React.ReactNode;
    className?: string;
}

const FormField: React.FC<FormFieldProps> = ({ label, htmlFor, error, children, className }) => {
    return (
        <div className={className}>
            <label htmlFor={htmlFor} className="block text-sm font-bold text-gray-700 mb-2">
                {label}
            </label>
            {children}
            {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        </div>
    );
};

export default FormField;
