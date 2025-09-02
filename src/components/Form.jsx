// "https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=0&longitude=0"

import { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useUrlPosition } from "../hooks/useUrlPosition";

import styles from "./Form.module.css";
import Button from "./Button";
import BackButton from "./BackButton";
import Message from "./Message";
import Spinner from "./Spinner";
import {useCities} from "../contexts/CitiesContext";
import { useNavigate } from "react-router-dom";

export function convertToEmoji(countryCode) {
  const codePoints = countryCode
    .toUpperCase()
    .split("")
    .map((char) => 127397 + char.charCodeAt());
  return String.fromCodePoint(...codePoints);
}

const BASE_URL = "https://api.bigdatacloud.net/data/reverse-geocode-client";//api

function Form() {
  const [cityName, setCityName] = useState("");
  const [country, setCountry] = useState("");
  const [date, setDate] = useState(new Date());
  const [notes, setNotes] = useState("");
  const [lat, lng] = useUrlPosition();
  const [isLoadingGeocoding, setIsLoadingGeocoding] = useState(false);
  const [emoji, setEmoji] = useState("");
  const [geocodingError, setGeocodingError] = useState("");
  const {createCity, isLoading} = useCities();
  const navigate = useNavigate();

  //fetch data when the component mounts
  useEffect(
    function () {
      //If the user directly manually enters url and goes to '/app/form' without any lat and lng values then return without making any http request
      if (!lat && !lng) return;

      async function fetchCityData() {
        try {
          setIsLoadingGeocoding(true);
          setGeocodingError(""); //reset if there was any error in the previous fetch request

          const response = await fetch(
            `${BASE_URL}?latitude=${lat}&longitude=${lng}`
          );
          const data = await response.json();

          //Handle the situation where a user might click on the waters or anywhere where there is no country on the map.
          if (!data.countryCode) {
            throw new Error(
              "That doesn't seem to be a city.Click somewhere else 😊"
            );
          }

          setCityName(data.city || data.locality || ""); //if user clicks on a small place the city might not be present, in that case use the locality, if that is also not given then use an empty string.
          setCountry(data.countryName);
          setEmoji(convertToEmoji(data.countryCode));
        } catch (error) {
          setGeocodingError(error.message);
        } finally {
          setIsLoadingGeocoding(false);
        }
      }
      fetchCityData();
    },
    [lat, lng]
  );


  //The form will get submitted when one of the buttons is clicked, that is also the reason why in BackButton component's onClick event handler we did e.preventDefault() so that the form does not get submitted. This means only the Add button can submit the form now, but we dont want that as it will make the page hard reload and that should not happen in a SPA (Single Page Application).
  async function handleSubmit(e) {
    e.preventDefault();

    if (!cityName || !date) return;

    const newCity = {
      cityName,
      country,
      emoji,
      date,
      notes,
      position: { lat, lng },
      //id will be automatically created and added by the json-server
    };  
    
    await createCity(newCity);
    navigate('/app/cities');//display the updated list of cities after adding the new city
  }

  if(isLoadingGeocoding) {
    return <Spinner />
  }

  if(!lat && !lng){
    return <Message message="Start by clicking on the map" />
  }

  if(geocodingError) {
    return <Message message={geocodingError} />
  }

  return (
    <form className={`${styles.form} ${isLoading? styles.loading : ''}`} onSubmit={handleSubmit}>
      <div className={styles.row}>
        <label htmlFor="cityName">City name</label>
        <input
          id="cityName"
          onChange={(e) => setCityName(e.target.value)}
          value={cityName}
        />
        <span className={styles.flag}>{emoji}</span> 
      </div>

      <div className={styles.row}>
        <label htmlFor="date">When did you go to {cityName}?</label>
        <DatePicker
          id="date"
          selected={date} //instead of the value prop we use selected prop to display the selected date in the DatePicker (refer to documentation)
          onChange={(d) => setDate(d)}
          dateFormat="dd/MM/yyyy"
        />
      </div>

      <div className={styles.row}>
        <label htmlFor="notes">Notes about your trip to {cityName}</label>
        <textarea
          id="notes"
          onChange={(e) => setNotes(e.target.value)}
          value={notes}
        />
      </div>

      <div className={styles.buttons}>
        <Button type="primary">Add</Button>
        <BackButton />
      </div>
    </form>
  );
}

export default Form;
