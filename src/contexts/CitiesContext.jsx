import { createContext, useState, useEffect, useContext } from "react";

const CitiesContext = createContext();

function CitiesProvider({ children }) {
  const [cities, setCities] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(function () {
    async function fetchCities() {
      try {
        setIsLoading(true);
        const res = await fetch(`${import.meta.env.VITE_BASE_URL}/cities`);
        const data = await res.json();
        setCities(data);
      } catch (err) {
        alert("There was an error in loading data...");
      } finally {
        setIsLoading(false);
      }
    }

    fetchCities();
  }, []);

  return (
    <CitiesContext.Provider
      value={{ cities, isLoading }}
    >{children}</CitiesContext.Provider>
  );
}

function useCities() {
    const context = useContext(CitiesContext);
    if(context === undefined)
        throw new Error("CitiesContext was used outside of CitiesProvider");
    return context;
}

export {CitiesProvider, useCities};