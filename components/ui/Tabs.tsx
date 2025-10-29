

import React from 'react';

// This is a simplified implementation of a Tabs component to satisfy the usage in the app.

interface TabsContextType {
    activeTab: string;
    onTabChange: (value: string) => void;
}

const TabsContext = React.createContext<TabsContextType | null>(null);

export const Tabs: React.FC<{ value: string; onValueChange: (value: string) => void; children: React.ReactNode; className?: string }> = ({ value, onValueChange, children, className }) => {
    return (
        <TabsContext.Provider value={{ activeTab: value, onTabChange: onValueChange }}>
            <div className={className}>{children}</div>
        </TabsContext.Provider>
    );
};

export const TabsList: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => {
    return (
        <div className={`inline-flex h-auto items-center justify-center rounded-lg bg-gray-100 p-1 text-gray-500 mb-6 flex-wrap ${className}`}>
            {children}
        </div>
    );
};

export const TabsTrigger: React.FC<{ value: string; children: React.ReactNode; className?: string }> = ({ value, children, className }) => {
    const context = React.useContext(TabsContext);
    if (!context) {
        throw new Error("TabsTrigger must be used within a Tabs component");
    }
    const isActive = context.activeTab === value;
    return (
        <button
            onClick={() => context.onTabChange(value)}
            data-state={isActive ? 'active' : 'inactive'}
            className={`inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-semibold transition-all gap-2 data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm ${className}`}
        >
            {children}
        </button>
    );
};

export const TabsContent: React.FC<{ value: string; children: React.ReactNode; className?: string }> = ({ value, children, className }) => {
    const context = React.useContext(TabsContext);
    if (!context) {
        throw new Error("TabsContent must be used within a Tabs component");
    }
    return context.activeTab === value ? <div className={className}>{children}</div> : null;
};