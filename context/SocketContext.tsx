import React, { createContext, useContext, useState } from 'react';

interface RootLayoutProps {
    children: React.ReactNode;
}

interface SocketContextProps {
    messages: any[];
    connection: any
}

const SocketContext = createContext<SocketContextProps | undefined>(undefined);

export const SocketProvider = ({ children }: RootLayoutProps) => {

    const [connection, setConnection] = useState<null | string>(null);
    const [messages, setMessages] = useState<any[]>([]);

    return (
        <SocketContext.Provider value={{ messages, connection }}>{children}</SocketContext.Provider>
    )
}

export const useSocket = () => {
    const context = useContext(SocketContext);
    if (context === undefined) {
        throw new Error("Error using Socket Context");
    }
    return context;
};