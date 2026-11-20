// Rank user based on boost and common interests

export interface UserProfile {
  myActivities?: string[] | null;
  location?: string | null;
}

export function rankUsers(
  allUsers: Array<{
    users: {
      uuid: string;
      intressen?: string[] | null;
      location?: string | null;
    };
    [key: string]: unknown;
  }>,
  currentUserProfile: UserProfile,
  boostedUuids: Set<string>,
) {
  const currentUserInterests = currentUserProfile?.myActivities ?? [];
  const currentUserLocation = currentUserProfile?.location;

  const ranked = allUsers.map((entry) => {
    let score = 1;

    const userInterests = entry.users.intressen || [];

    const sharedInterests = userInterests.filter((interest) =>
      currentUserInterests.includes(interest),
    );

    if (sharedInterests.length > 0) {
      score += sharedInterests.length * 0.5;
    }

    const userLocation = entry.users.location;

    if (userLocation && currentUserLocation) {
      const userCity = userLocation.split(",")[0].trim();
      const currentUserCity = currentUserLocation.split(",")[0].trim();

      if (userCity === currentUserCity) {
        score += 10;
      }
    }

    const boostMultiplier = 5;
    if (boostedUuids.has(entry.users.uuid)) {
      score = score * boostMultiplier;
    }

    return {
      ...entry,
      score,
    };
  });

  ranked.sort((a, b) => b.score - a.score);

  return ranked;
}