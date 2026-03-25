
import { LocationProvider, useLocation } from "../../contexts/LocationContext";
import MapView from "../map/Map";

export function InnerMap() {
    const { locationStatus } = useLocation();

    return (
<>
        { locationStatus && <p id="status">{locationStatus}</p>}
       <MapView></MapView>

</>
)
   

}


export default function MapPage() {


    return (
        <LocationProvider>
            <InnerMap />

        </LocationProvider>

    );
}