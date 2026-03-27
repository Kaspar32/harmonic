"use client"

import {createContext, useContext, useState, useEffect} from "react";

interface NotificationContextProps{

  addNotification: (from:string )=> void;
  notifications: Notification[];
} 

interface Notification{

  from: string;
}



const NotificationContext = createContext<NotificationContextProps | undefined>(undefined);


export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {

  const[notifications, setNotifications]= useState<Notification[]>([]);


  function addNotification(from: string )
  {
    setNotifications((prev) => [...prev,{from}]);

  }

    






     return (
    <NotificationContext.Provider value={{ addNotification, notifications }}>
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
