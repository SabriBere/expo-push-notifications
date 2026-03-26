import { useQueryClient } from "@tanstack/react-query";
import React, { createContext, RefObject, useContext, useEffect, useRef, useState } from 'react';
import { triggerPushNotifications } from './NotificationsUtils';

interface RootLayoutProps {
    children: React.ReactNode;
}
interface SocketContextProps {
    socketRef: RefObject<WebSocket | null>;
    // messages: any[];
    connection: any
}

const SocketContext = createContext<SocketContextProps | undefined>(undefined);

export const SocketProvider = ({ children }: RootLayoutProps) => {
    const queryClient = useQueryClient();
    const socketRef = useRef<WebSocket | null>(null);
    const socketUrl = "ws://192.168.1.12:8001";
    const [connection, setConnection] = useState<null | string>(null);

    useEffect(() => {
        const socket = new WebSocket(`${socketUrl}`);
        socketRef.current = socket;

        socket.onopen = () => {
            console.log("Success - Connected");
            socket.send(JSON.stringify({ type: "HELLO_SERVER" }));
        };

        socket.onmessage = async (event: MessageEvent) => {
            try {
                const payload = JSON.parse(event.data);

                const notificationsData = Array.isArray(payload)
                    ? payload
                    : Array.isArray(payload?.data)
                        ? payload.data
                        : [];

                queryClient.setQueryData(["notifications"], notificationsData);

                if (notificationsData.length > 0) {
                    await triggerPushNotifications(notificationsData);
                }
            } catch (error) {
                console.error("Error to receive notifications", error);
            }
        };


        socket.onerror = (event: any) => {
            console.error("Error to connect Socket", event);
        };

        return () => {
            socket.close();
        }
    }, [])

    return (
        <SocketContext.Provider value={{ socketRef, connection }}>{children}</SocketContext.Provider>
    )
}

export const useSocket = (): SocketContextProps => {
    const context = useContext(SocketContext);
    if (!context) {
        throw new Error("useSocket must be used with SocketContexProvider");
    }
    return context;
};