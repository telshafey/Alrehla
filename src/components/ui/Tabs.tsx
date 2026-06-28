
import React, { useState, createContext, useContext, useCallback, useMemo } from 'react';
import { cn } from '../../lib/utils';

// This is a more robust implementation of a Tabs component that supports both
// controlled (value/onValueChange) and uncontrolled (defaultValue) modes.

interface TabsContextType {
    activeTab: string;
    onTabChange: (value: string) => void;
}

const TabsContext = createContext<TabsContextType | null>(null);

export const Tabs: React.FC<{ 
    defaultValue?: string;
    value?: string; 
    onValueChange?: (value: string) => void; 
    children: React.ReactNode; 
    className?: string 
}> = ({ defaultValue, value, onValueChange, children, className }) => {
    const [internalValue, setInternalValue] = useState(defaultValue);

    const isControlled = value !== undefined;
    const activeTab = isControlled ? value : internalValue;

    const handleTabChange = useCallback((newValue: string) => {
        if (onValueChange) {
            onValueChange(newValue);
        }
        if (!isControlled) {
            setInternalValue(newValue);
        }
    }, [onValueChange, isControlled]);
    
    if (activeTab === undefined) {
         console.error("Tabs component must be either controlled (with value and onValueChange props) or uncontrolled (with a defaultValue prop).");
         return null;
    }

    const contextValue = useMemo(() => ({
        activeTab: activeTab as string,
        onTabChange: handleTabChange
    }), [activeTab, handleTabChange]);

    return (
        <TabsContext.Provider value={contextValue}>
            <div className={cn(className)}>{children}</div>
        </TabsContext.Provider>
    );
};

export const TabsList: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => {
    return (
        <div className={cn(
            'inline-flex h-auto sm:h-12 items-center justify-start sm:justify-center rounded-lg bg-muted p-1 text-muted-foreground mb-6 w-full overflow-x-auto no-scrollbar', 
            className
        )}>
            <div className="flex w-full sm:w-auto min-w-full sm:min-w-0 space-x-1 rtl:space-x-reverse px-1">
                {children}
            </div>
        </div>
    );
};

export const TabsTrigger: React.FC<{ value: string; children: React.ReactNode; className?: string }> = ({ value, children, className }) => {
    const context = useContext(TabsContext);
    if (!context) {
        throw new Error("TabsTrigger must be used within a Tabs component");
    }
    const isActive = context.activeTab === value;
    return (
        <button
            onClick={() => context.onTabChange(value)}
            data-state={isActive ? 'active' : 'inactive'}
            className={cn(
              'inline-flex items-center justify-center whitespace-nowrap rounded-md px-4 py-2 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 flex-shrink-0',
              'data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm data-[state=active]:font-bold',
              'hover:bg-background/50 hover:text-foreground/80',
               'gap-2 h-9 sm:h-auto',
               className
            )}
        >
            {children}
        </button>
    );
};

export const TabsContent: React.FC<{ value: string; children: React.ReactNode; className?: string }> = ({ value, children, className }) => {
    const context = useContext(TabsContext);
    if (!context) {
        throw new Error("TabsContent must be used within a Tabs component");
    }
    return context.activeTab === value ? <div className={cn('mt-2 animate-fadeIn', className)}>{children}</div> : null;
};
