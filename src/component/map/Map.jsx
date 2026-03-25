import { useEffect } from "react";
import { useRef } from "react";
import L from "leaflet";
import "./map.css";
import { useLocation } from "../../contexts/LocationContext";
import socket from "../../socket/socket";


export default function MapView() {

    const {location, locationStatus, nearby,nearbyUsers, setNearbyUsers} = useLocation();
    

   
    const html1 = "<div class='police'></div>";
    const html2 = "<div class='hospital'></div>";
    const html3= "<div class='fuel'></div>";
    const html4= "<div class='fire'></div>";
    const html5= "<div class='user'></div>";


    const mapref = useRef(null);
    const mapContainer = useRef(null);
    const useMarker = useRef(null);
    const nearbyLayerRef = useRef(null);
    const isFirstLoad = useRef(true);
    const usersRef = useRef(null);
    const markerRef= useRef(new Map());

    const apiUrl =`http://localhost:4000/api/v1`;
    useEffect(() => {
        if (mapref.current) return;
        
        const map = L.map(mapContainer.current).setView([0, 0], 1);
        mapref.current = map;


        L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
            attribution: "@OpenStreetMap &copyCartoCDN"
        }).addTo(map);

          



    }, []);

useEffect(()=>{

    async function sendLocation(lng, lat){
        try{
            const token = JSON.parse(localStorage.getItem("sostoken"));

            const id = token.id
            const res = await fetch(`${apiUrl}/storelocation`,{
                method: "POST",
                headers: {"Content-type":"application/json"},
                body: JSON.stringify({id, lng, lat})
            });

            const data = await res.json()
            if(!res.ok){
                console.log(data.message);
                return;
            }

            console.log(data.message)

        }catch(err){
            console.error(err);
        }

    }
  
        if(!location || !mapref.current) return;         
                console.log(location);
                const map =mapref.current;

                 if(!useMarker.current){

                       useMarker.current=  L.marker([location.lat, location.lon], {
                icon: L.divIcon({
                    className: "custom-marker",
                    html: "<div class='mark'></div>"
                })
            }).addTo(mapref.current).bindPopup("You are here");



                }else{
                    useMarker.current.setLatLng([location.lat, location.lon])
                }
            

             if(isFirstLoad.current){
                  map.setView([location.lat, location.lon],18);
                isFirstLoad.current=false;
             }
             const token = JSON.parse(localStorage.getItem("sostoken"));

            const userId= token.id
            socket.emit("location:update",{
                userId,
                lat: location.lat,
                lng: location.lon
            })
               

},[location]);

useEffect(()=>{
    const token = JSON.parse(localStorage.getItem("sostoken"));
    const userId = token.id;
    if(location){
        socket.emit("location:update",{
            userId,
            lat: location.lat,
            lng: location.long
        })
    }
    
},[])



useEffect(() => {
  socket.on("nearby:list", (users) => {
    console.log("INITIAL USERS:", users);
    setNearbyUsers(users);
  });

  return () => socket.off("nearby:list");
}, []);
useEffect(() => {
 if(usersRef.current) return;

  if (!mapref.current) return;
  const map = mapref.current;

  usersRef.current=L.layerGroup().addTo(map);
}, []);


useEffect(()=>{
    
    if (!usersRef.current) return;
    const currentIds = new Set(nearbyUsers.map(u => String(u.userId)));

markerRef.current.forEach((marker, id) => {
  if (!currentIds.has(id)) {
    usersRef.current.removeLayer(marker);
    markerRef.current.delete(id);
  }
});

     console.log("nearby:", nearbyUsers);
    function renderUsers(data, color){
        console.log("nearby users loading")
        if (!data || !Array.isArray(data)) return; 

         console.log("ADDING MARKER:");
       data.forEach(place => {
        if(!place) return;
                 if (place.lat==null || place.lng==null) return;

                 const existingMarker = markerRef.current.get(place.userId);

                   console.log(" MARKER inside:" , place.lat, place.lng);

                   if(existingMarker){
                    console.log("updating MARKER inside:" , place.lat, place.lng);
                    existingMarker.setLatLng([place.lat, place.lng]);
                   }else{
                        console.log("ADDING MARKER inside:" , place.lat, place.lng);
                          const marker =L.marker([Number(place.lat), Number(place.lng)], {
                    icon: L.divIcon({
                        className: "custom-marker",
                        html: color,

                    })
                }).addTo(usersRef.current)
                    .bindPopup(place.userId);
                    markerRef.current.set(place.userId, marker)
                   }
          
            });
        
    }

    renderUsers(nearbyUsers, html5);
          


        
},[nearbyUsers]);


useEffect(() => {
  const handler = ({ userId }) => {
    const id = String(userId);

    const marker = markerRef.current.get(id);

    if (marker) {
      usersRef.current.removeLayer(marker);
      markerRef.current.delete(id);
    }

    setNearbyUsers((prev = []) =>
      prev.filter(u => String(u.userId) !== id)
    );
  };

  socket.on("user:offline", handler);

  return () => {
    socket.off("user:offline", handler); // 🔥 cleanup
  };
}, []);





useEffect(()=>{
    if(mapref.current && !nearbyLayerRef.current){
        nearbyLayerRef.current= L.layerGroup().addTo(mapref.current);
    }
},[]);












useEffect(()=>{
    if (!nearbyLayerRef.current) return;

  nearbyLayerRef.current.clearLayers();

    function renderPlaces(data, color){
        if (!data || !Array.isArray(data)) return; 
       data.forEach(place => {
                 if (!place.lat || !place.lon) return;
                L.marker([Number(place.lat), Number(place.lon)], {
                    icon: L.divIcon({
                        className: "custom-marker",
                        html: color,

                    })
                }).addTo(nearbyLayerRef.current)
                    .bindPopup(place.display_name)
            });
        
    }

            renderPlaces(nearby?.police, html1)
            renderPlaces(nearby?.hospitals, html2)
            renderPlaces(nearby?.fuel, html3)
            renderPlaces(nearby?.fire, html4)


        
},[nearby])





    return (
        <div id="map" ref={mapContainer} style={{ width: "100%" }}>
           
        </div>
    )

}
