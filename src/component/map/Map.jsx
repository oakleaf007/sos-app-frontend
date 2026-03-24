import { useEffect } from "react";
import { useRef } from "react";
import L from "leaflet";
import "./map.css";
import { useLocation } from "../../contexts/LocationContext";
export default function Map() {

    const {location, locationStatus, nearby} = useLocation();
    


    const html1 = "<div class='police'></div>";
    const html2 = "<div class='hospital'></div>";
    const html3= "<div class='fuel'></div>";
    const html4= "<div class='fire'></div>";


    const mapref = useRef(null);
    const mapContainer = useRef(null);
    const useMarker = useRef(null);
    const nearbyLayerRef = useRef(null);
    const isFirstLoad = useRef(true);
    const apiUrl =`http://localhost:4000/api/v1`;
    useEffect(() => {
        if (mapref.current) return;
        
        const map = L.map(mapContainer.current).setView([0, 0], 1);
        mapref.current = map;


        L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
            attribution: "@OpenStreetMap &copyCartoDB"
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
             sendLocation(location.lon, location.lat);
               

},[location]);


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
