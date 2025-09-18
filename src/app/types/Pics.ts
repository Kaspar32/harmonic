export interface Pics {
    findIndex(arg0: (item: any) => boolean): unknown;
    map(arg0: (img: any) => any): Pics;
    id: string| null;
    image: File | null;
    imageBase64: string | null;
    userUuid: string| null;
    position: number| null;
  }