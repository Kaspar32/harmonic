
export interface FavoriteTrack {
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
  favorite_artist2: FavoriteArtist | null;
  roles: string;
  fakeUsersEnabled: boolean;
}

export interface FavoriteArtist {
  favorite_artist: any;
  name: string;
  image: string | null;
}