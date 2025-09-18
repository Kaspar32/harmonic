
export interface FavoriteTrack {
  album: any;
  name: string;
  image: string | null;
  artist: string | null;
}

export interface UserType {
  
  uuid: string;
  name: string;
  geschlecht: string;
  alter: string;
  grösse: string;
  ausbildung: string;
  intressen: string[];
  ichsuche: string[];
  genres: string[];
  favorite_track: FavoriteTrack | null;
  favorite_artist: FavoriteArtist | null;
}

export interface FavoriteArtist {
  name: string;
  image: string | null;
}