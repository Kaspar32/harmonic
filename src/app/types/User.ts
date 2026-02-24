
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
  roles: string;
  fakeUsersEnabled: boolean;
  profile_pics: string[];
}



export interface FavoriteArtist {
  favorite_artist1?: Artist;
  favorite_artist2?: Artist;
}

export interface Artist {
  name: string;
  image: string | null;
}