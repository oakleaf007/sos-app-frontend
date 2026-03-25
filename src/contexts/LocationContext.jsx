
import { createContext, useContext, useEffect, useRef, useState } from "react";

import { useAuth } from "./AuthContext";

import socket from "../socket/socket";

const LocationContext = createContext();


export function LocationProvider({ children }) {



    const {isLoggedIn} = useAuth();
     const hasFetched = useRef(false);
    const nearByUrl =`http://localhost:4000/api/v1/nearbyfetch`;

    const [location, setLocation] = useState(null);
    // const [ipLocation, setIpLocation] = useState(null);
    const [locationStatus, setLocationStatus] = useState("");
    const [nearbyUsers, setNearbyUsers] = useState([]);
    const [nearby, setNearby] = useState({
        hospitals: [],
        police: [],
        fuel: [],
        fire:[]
    });
    const watchIdRef = useRef(null);
    const isActiveRef = useRef(true);

    useEffect(()=>{
        const token = JSON.parse(localStorage.getItem("sostoken"));

        if(!token) return ;

        const userId = token.id;
        socket.connect();
        socket.on("connect",()=>{
            console.log("socket connected", socket.id);
            socket.emit("register", userId);
        })
        socket.on("nearby:update", (data)=>{
            setNearbyUsers((prev=[])=>{
                const map = new Map();
               prev.forEach(u=>{
                if(u) map.set(u.userId, u);
               });
               map.set(data.userId, data);
               return Array.from(map.values());
            });
           
        });
         return ()=>{
        socket.disconnect();
    }
    },[]);

   

    useEffect(() => {
      
        // getting location permission

        if(!isLoggedIn){
               if (watchIdRef.current) {
            navigator.geolocation.clearWatch(watchIdRef.current);
            watchIdRef.current = null;
        }

        setLocation(null);

        return;

        }
        async function checkLocationPermission() {
            if (!navigator.permissions) return "unknown";
            const res = await navigator.permissions.query({ name: "geolocation" });
            return res.state;

        }

        navigator.permissions?.query({ name: "geolocation" }).then(permission => {

            permission.onchange = () => {

                if (permission.state === "denied") {
                    setLocationStatus("location permission denied");
                    if (watchIdRef.current) {
                        navigator.geolocation.clearWatch(watchIdRef.current);
                        watchIdRef.current = null;
                    }
                }

                if (permission.state === "granted") {
                    setLocationStatus("");
                    getGpsLocation();
                }

            };

        });

        // checking the location permission

        async function checkGPS() {

            const permission = await checkLocationPermission();

            if (permission === "denied") {
                setLocationStatus("location permission denied");
                return false;
            }
            return true;


        }
   

        async function getGpsLocation() {
            if (watchIdRef.current) return;

            if (!navigator.geolocation) {
                
                setLocationStatus("not supported");
                return;
            }
            watchIdRef.current = navigator.geolocation.watchPosition(
                position => {
                    const lat = position.coords.latitude;
                    const lon = position.coords.longitude;
                    console.log(lat, lon)
                    setLocation({
                        lat, lon
                    });
                    if (!hasFetched.current) {
                        loadNearby(lat, lon);
                        hasFetched.current = true;
                    }

                },
                (error) => {
                    if (error.code === error.PERMISSION_DENIED) {
                        setLocationStatus("location permission denied");
                        console.error("location permission denied");

                    }


                    else if (error.code === error.POSITION_UNAVAILABLE) {
                        setLocationStatus("possition unavailable, device GPS is off probably");
                        console.error("location unavailable");

                    }

                    else if (error.code === error.TIMEOUT) {
                        setLocationStatus("Timeout")
                        console.error("timeout error");


                    }
                },

                { enableHighAccuracy: false, timeout: 15000, maximumAge: 10000 }
            );


        }

        async function searchplace(query, lat, lon) {
            if(!isActiveRef.current) return;
            const url = `${nearByUrl}?query=${query}&lat=${lat}&lon=${lon}`;

            const res = await fetch(url);
            const data = await res.json();

            console.log(data);
            return data;
        }
        function delay(ms) {
            return new Promise(resolve => setTimeout(resolve, ms));
        }

        async function loadNearby(lat, lon) {
            try {
                const hospitals = await searchplace("hospital", lat, lon);
                setNearby((prev => ({ ...prev, hospitals })));
                await delay(2000);

                const police = await searchplace("police", lat, lon);
                setNearby((prev => ({ ...prev, police })));

                await delay(2000);
                const fuel = await searchplace("petrol", lat, lon);
                setNearby((prev => ({ ...prev, fuel })))

                await delay(2000);
                const fire = await searchplace("fire station", lat, lon);
                setNearby((prev => ({ ...prev, fire })))


            } catch (err) {
                console.error(err);
            }


        }
        async function init() {
            const allowed = await checkGPS();
            if (!allowed) {
                console.error("gps permission denied");
                return;
            }
            try {
                
               
                await getGpsLocation();

            } catch (err) {
                console.error(err);

            }

        }
        init();


        return () => {
            if (watchIdRef.current) navigator.geolocation.clearWatch(watchIdRef.current);
            watchIdRef.current=null;
        }

    }, []);

      function stopTracking(){
         if (watchIdRef.current) {
            navigator.geolocation.clearWatch(watchIdRef.current);
            watchIdRef.current=null;
            isActiveRef.current = false;
        }
        }

    return (
        <LocationContext.Provider value={{ location, locationStatus,nearbyUsers,setNearbyUsers, nearby ,stopTracking}}>
            {children}
        </LocationContext.Provider>
    )

}


export function useLocation() {
    return useContext(LocationContext);
}
