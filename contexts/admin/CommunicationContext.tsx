import React, { createContext, useContext, ReactNode } from 'react';

interface CommunicationContextType {}

const CommunicationContext = createContext<CommunicationContextType | undefined>(undefined);

export const CommunicationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const value = {};

    return <CommunicationContext.Provider value={value}>{children}</CommunicationContext.Provider>;
};

export const useCommunication = (): CommunicationContextType => {
    const context = useContext(CommunicationContext);
    if (context === undefined) {
        throw new Error('useCommunication must be used within a CommunicationProvider');
    }
    return context;
};
