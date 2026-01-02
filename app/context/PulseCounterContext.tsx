import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface PulseCounterContextValue {
    pulseCount: number;
    incrementPulse: () => void;
    resetCounter: () => void;
    getEnergyValue: () => number;
}

const PulseCounterContext = createContext<PulseCounterContextValue | undefined>(undefined);

export const PulseCounterProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [pulseCount, setPulseCount] = useState<number>(0);

    // Incrementa o contador a cada pulso recebido
    const incrementPulse = useCallback(() => {
        setPulseCount(prev => prev + 1);
    }, []);

    // Reseta o contador
    const resetCounter = useCallback(() => {
        setPulseCount(0);
    }, []);

    // Converte pulsos para valor de energia (kWh)
    // Assumindo que cada pulso representa 0.1 kWh (ajuste conforme necessário)
    const getEnergyValue = useCallback(() => {
        // Cada pulso = 0.1 kWh
        return pulseCount * 0.1;
    }, [pulseCount]);

    return (
        <PulseCounterContext.Provider
            value={{
                pulseCount,
                incrementPulse,
                resetCounter,
                getEnergyValue,
            }}
        >
            {children}
        </PulseCounterContext.Provider>
    );
};

export const usePulseCounter = () => {
    const context = useContext(PulseCounterContext);
    if (!context) {
        throw new Error('usePulseCounter must be used within a PulseCounterProvider');
    }
    return context;
};

