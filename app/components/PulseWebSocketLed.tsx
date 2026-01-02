import React, { useEffect, useRef } from "react";
import { ViewStyle } from "react-native";
import { usePulseCounter } from "../context/PulseCounterContext";

type PulseWebSocketLedProps = {
    url?: string;
    size?: number;
    pulseDurationMs?: number;
    onPulse?(rawMessage: string): void;
    style?: ViewStyle;
};

const PulseWebSocketLed: React.FC<PulseWebSocketLedProps> = ({
    url = "wss://energy-app-backend-nqub.onrender.com/ws",
    pulseDurationMs = 150,
    onPulse,
}) => {
    const { incrementPulse } = usePulseCounter();
    const wsRef = useRef<WebSocket | null>(null);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        const ws = new WebSocket(url);
        wsRef.current = ws;

        ws.onopen = () => {
            console.log('WebSocket connected');
        };

        ws.onmessage = (event) => {
            const data = String(event.data ?? "");
            
            // Incrementa o contador a cada mensagem recebida
            incrementPulse();
            
            // Chama o callback se fornecido
            onPulse?.(data);
        };

        ws.onerror = (error) => {
            console.error('WebSocket error:', error);
        };

        ws.onclose = () => {
            console.log('WebSocket disconnected');
        };

        return () => {
            wsRef.current?.close();
        };
    }, [url, incrementPulse, onPulse]);

    return null;
};




export default PulseWebSocketLed;


