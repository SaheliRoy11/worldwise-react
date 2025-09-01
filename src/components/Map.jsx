import styles from "./Map.module.css";
import { useNavigate, useSearchParams } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from "react-leaflet";
import { useEffect, useState } from "react";
import {useCities} from "../contexts/CitiesContext.jsx";

const flagemojiToPNG = (flag) => {
  var countryCode = Array.from(flag, (codeUnit) => codeUnit.codePointAt())
    .map((char) => String.fromCharCode(char - 127397).toLowerCase())
    .join("");
  return (
    <img src={`https://flagcdn.com/24x18/${countryCode}.png`} alt="flag" />
  );
};

export default function Map() {
  const {cities} = useCities();//global state using Context API

  const [mapPosition, setMapPosition] = useState([40, 0]);
  const [searchParams] = useSearchParams();//data from url
  const mapLat = searchParams.get("lat");
  const mapLng = searchParams.get("lng");
     
  //Synchronizes the map data to the City component.If the values are null that is no city is selected then the initial state value is used.If they have value then their values are used to render the map.If user clicks on backbutton after viewing details of a city, the values of mapLat and map goes back to null and hence not updated in mapPosition, therefore the map now will show the last selected city's position and not reset to initial values.
  useEffect(function(){
    if(mapLat && mapLng)
      setMapPosition([mapLat, mapLng]);
  }, [mapLat, mapLng]);

  return (
    <div className={styles.mapContainer} >
      <MapContainer center={mapPosition} zoom={5} scrollWheelZoom={true} className={styles.map}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png"
        />
        {
          cities.map((city) => {
            const {lat,lng} = city.position;
            
          return <Marker position={[lat, lng]} key={city.id}>
          <Popup>
            <span>{flagemojiToPNG(city.emoji)}</span> <span>{city.cityName}</span>
          </Popup>
        </Marker>
        })
        }
        
        <ChangeCenter position={mapPosition} />
        <DetectClick />
      </MapContainer>
    </div>
  );
}

//Render the map based on selected city.Props in MapContainer of leaflet is immutable i.e. it does not get re-centered automatically when a component's prop is updated.Therefore it is a technique to create a custom component and use it to implement the required feature
function ChangeCenter({position}) {
  const map = useMap();//this hook is provided by leaflet to get the instance of the map that is currently displayed
  map.setView(position);//also provided by leaflet

  return null;//since this is a component it needs to return some JSX and null is valid JSX
}

//custom hook to implement the functionality of opening a form when user clicks anywhere on the map.The form must get access to the lat and lng values based on the click on the map, to store inside the new city object.
function DetectClick() {
  const navigate = useNavigate();

  // provided by leaflet
  useMapEvents({
    click: (e) => navigate(`form?lat=${e.latlng.lat}&lng=${e.latlng.lng}`)
  })
}