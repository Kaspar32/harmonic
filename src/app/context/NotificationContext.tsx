"use client"

import {createContext, useContext, useState, useEffect} from "react";

interface NotificationContextProps{


} 


const NotificationContext = createContext<NotificationContextProps | undefined>(undefined);


export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {

    






     return (
    <NotificationContext.Provider value={{  }}>
      {children}
    </NotificationContext.Provider>
  );
};


export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotification must be used within a NotificationProvider");
  }
  return context;
};
