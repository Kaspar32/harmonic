import { UserType } from "@/app/types/User";

type LikesCacheType = {
  likes?: {
    images: any[];
    users: UserType[];
  };
  likesYou?: {
    images: any[];
    users: UserType[];
  };
};

export const likesCache: LikesCacheType = {};