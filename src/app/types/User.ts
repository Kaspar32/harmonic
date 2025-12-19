
export interface FavoriteTrack {
  album: string;
  name: string;
  image: string | null;
  artist: string | null;
}

export interface UserType {
  
  uuid: string;
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
}

export interface FavoriteArtist {
  name: string;
  image: string | null;
}