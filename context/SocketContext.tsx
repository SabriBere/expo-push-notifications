import { useQueryClient } from "@tanstack/react-query";
import React, { createContext, RefObject, useContext, useEffect, useRef, useState } from 'react';
import { AppState, AppStateStatus } from "react-native";
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
    const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const isUnmountingRef = useRef(false);
    const appStateRef = useRef<AppStateStatus>(AppState.currentState);
    const socketUrl = "ws://192.168.1.12:8001";
    const [connection, setConnection] = useState<null | string>(null);

    useEffect(() => {
        function clearReconnectTimeout() {
            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current);
                reconnectTimeoutRef.current = null;
            }
        }

        function scheduleReconnect(delay = 3000) {
            if (isUnmountingRef.current || reconnectTimeoutRef.current) return;

            reconnectTimeoutRef.current = setTimeout(() => {
                reconnectTimeoutRef.current = null;
                connectSocket();
            }, delay);
        }

        function connectSocket(forceReconnect = false) {
            const currentSocket = socketRef.current;

            if (currentSocket) {
                const isOpenOrConnecting =
                    currentSocket.readyState === WebSocket.OPEN ||
                    currentSocket.readyState === WebSocket.CONNECTING;

                if (isOpenOrConnecting && !forceReconnect) {
                    return;
                }

                currentSocket.close();
                socketRef.current = null;
            }

            clearReconnectTimeout();

            const socket = new WebSocket(`${socketUrl}`);
            socketRef.current = socket;

            socket.onopen = () => {
                console.log("Success - Connected");
                setConnection("connected");
                clearReconnectTimeout();
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
                setConnection("error");
            };

            socket.onclose = () => {
                console.log("Socket closed. Retrying connection...");
                setConnection("disconnected");

                if (socketRef.current === socket) {
                    socketRef.current = null;
                }

                scheduleReconnect();
            };
        }

        const appStateSubscription = AppState.addEventListener("change", (nextAppState) => {
            const wasInBackground = appStateRef.current.match(/inactive|background/);

            if (wasInBackground && nextAppState === "active") {
                connectSocket(true);
            }

            appStateRef.current = nextAppState;
        });

        connectSocket();

        return () => {
            isUnmountingRef.current = true;
            appStateSubscription.remove();
            clearReconnectTimeout();
            socketRef.current?.close();
            socketRef.current = null;
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
