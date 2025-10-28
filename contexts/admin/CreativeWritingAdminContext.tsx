import React, { createContext, useContext, ReactNode } from 'react';

interface CreativeWritingAdminContextType {}

const CreativeWritingAdminContext = createContext<CreativeWritingAdminContextType | undefined>(undefined);

export const CreativeWritingAdminProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const value = {};

    return <CreativeWritingAdminContext.Provider value={value}>{children}</CreativeWritingAdminContext.Provider>;
};

export const useCreativeWritingAdmin = (): CreativeWritingAdminContextType => {
    const context = useContext(CreativeWritingAdminContext);
    if (context === undefined) {
        throw new Error('useCreativeWritingAdmin must be used within a CreativeWritingAdminProvider');
    }
    return context;
};
