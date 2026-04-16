
export interface FavoriteTrack {
  name: string;
  image: string | null;
  artist: string | null;
  preview: string | null;
}

export interface UserType {
  
  uuid: string;
  name: string;
  geschlecht: string;
  alter: string;
  geburtstag: string;
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
  location: string | null;
}



export interface FavoriteArtist {
  favorite_artist1?: Artist;
  favorite_artist2?: Artist;
  favorite_artist3?: Artist;
  favorite_artist4?: Artist;
  favorite_artist5?: Artist;
  favorite_artist6?: Artist;
  favorite_artist7?: Artist;
  favorite_artist8?: Artist;
  favorite_artist9?: Artist;
  favorite_artist10?: Artist;
}

export interface Artist {
  name: string;
  image: string | null;
}