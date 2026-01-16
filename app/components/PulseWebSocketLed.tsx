import React, { useEffect, useRef } from "react";
import { ViewStyle } from "react-native";

type PulseWebSocketLedProps = {
    url?: string;
    size?: number;
    pulseDurationMs?: number;
    onPulse?(rawMessage: string): void;
    style?: ViewStyle;
};

const PulseWebSocketLed: React.FC<PulseWebSocketLedProps> = ({
    url = "wss://energy-app-backend-nqub.onrender.com/ws",
    pulseDurationMs = 300,
    onPulse,
}) => {
    const wsRef = useRef<WebSocket | null>(null);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        const ws = new WebSocket(url);
        wsRef.current = ws;

        ws.onopen = () => {
            console.log('teste');
        };

        ws.onmessage = (event) => {
            const data = String(event.data ?? "");
            
            
            onPulse?.(data);
        };

        ws.onerror = (error) => {
            console.error('');
        };


        return () => {
            wsRef.current?.close();
        };
    }, [url, onPulse]);

    return null;
};




export default PulseWebSocketLed;


