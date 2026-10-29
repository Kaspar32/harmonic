export function getLocation(): Promise<{ latitude: number; longitude: number }> {

    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error("Geolocation is not supported"));
            return ;
        } 


        navigator.geolocation.getCurrentPosition(
            (position) => {
                resolve({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                });
            },
            (error) => {
                reject(new Error("Unable to retrieve location: " + error.message));
            },
            {

                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 300000,
            
           }
    );
  });
}

