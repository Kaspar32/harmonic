"use client";
import { createContext, useContext, useState, useEffect } from "react";

type UserType = {
  id: string;
  uuid: string;
  passwort: string;
  name: string;
  geschlecht: string;
  alter: string;
  groesse: string;
  ausbildung: string;
  intressen: string[];
  ichsuche: string[];
  genres: string[];
  favorite_track: FavoriteTrack | null;
  favorite_artist: FavoriteArtist | null;
  roles: string;
  fakeUsersEnabled: boolean;
  profile_pics: string[];
};

export interface FavoriteTrack {
  name: string;
  image: string | null;
  artist: string | null;
}

export interface FavoriteArtist {
  favorite_artist1?: Artist;
  favorite_artist2?: Artist;
}

export interface Artist {
  name: string;
  image: string | null;
}

interface UserContextProps {
  user: UserType | null;
  loading: boolean;
  fetchUser: () => Promise<void>;
  setUser: React.Dispatch<React.SetStateAction<UserType | null>>;
}

const UserContext = createContext<UserContextProps | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchUser = async () => {

    

    setLoading(true);
    try {
      const res = await fetch("/api/auth/me", {
        method: "GET",
        credentials: "include",
      });

      if (res.ok) {
        const data = await res.json();
        setUser(data);
      } else {
        setUser(null);
      }
    } catch (err) {
      console.error("Error fetching user:", err);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(()=>{
    fetchUser();
  },[]);

  return (
    <UserContext.Provider value={{ user, loading, fetchUser, setUser }}>
      {children}
    </UserContext.Provider>
  );
};


export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};
