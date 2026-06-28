import React from 'react';

interface SectionProps {
    title: string;
    icon: React.ReactNode;
    children: React.ReactNode;
    className?: string;
    id?: string;
}

const Section: React.FC<SectionProps> = ({ title, icon, children, className = '', id }) => (
    <div id={id} className={`bg-white p-8 rounded-2xl shadow-lg mb-12 scroll-mt-24 ${className}`}>
      <div className="flex items-center mb-6">
        <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center bg-blue-100 rounded-full text-blue-600">
          {icon}
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 ms-4">{title}</h2>
      </div>
      <div className="prose prose-lg max-w-none text-gray-600 leading-loose">
          {children}
      </div>
    </div>
);

export default Section;
