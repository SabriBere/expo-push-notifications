import React, { createContext, RefObject, useContext, useRef, useState, useEffect } from 'react';
import { useQueryClient } from "@tanstack/react-query";
import Constants from "expo-constants";

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
    // const [messages, setMessages] = useState<any[]>([]);

    useEffect(() => {
        // if(!socketUrl){
        //     console.log("Miss URL of Socket")
        // }

        const socket = new WebSocket(`${socketUrl}`);
        socketRef.current = socket;

         socket.onopen = () => {
            console.log("Success - Connected");
            socket.send(JSON.stringify({ type: "HELLO_SERVER" }));
        };

        socket.onmessage = (event: MessageEvent) => {
            try {
                const notificationsData = JSON.parse(event.data);
                queryClient.setQueryData(["notifications"], notificationsData ?? []);
            } catch (error) {
                console.error("Error to recibe notifications", error);
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