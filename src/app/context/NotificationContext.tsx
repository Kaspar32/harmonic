"use client"

import {createContext, useContext, useState, useEffect} from "react";

interface NotificationContextProps{

  addNotification: (from:string )=> void;
  notifications: Notification[];
  sameTasteNotifications: Notification[];
  addSameTasteNotification: (to:string )=> void;
} 

interface Notification{

  from?: string;
  to?:string;
}



const NotificationContext = createContext<NotificationContextProps | undefined>(undefined);


export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {

  const[notifications, setNotifications]= useState<Notification[]>([]);
  const [sameTasteNotifications, setSameTasteNotifications]= useState<Notification[]>([]);


  function addNotification(from: string )
  {
    setNotifications((prev) => [...prev,{from}]);

  }

  function addSameTasteNotification(to: string)
  {
    setSameTasteNotifications((prev) => [...prev,{to}]);
  }

  

     return (
    <NotificationContext.Provider value={{ addNotification, notifications, sameTasteNotifications, addSameTasteNotification }}>
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
