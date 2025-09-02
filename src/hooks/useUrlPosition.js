
import { useSearchParams } from "react-router-dom"; 

//Here we are creating a custom hook(useUrlPosition) on top of another custom hook(useSearchParams is a custom hook coming from React Router).The logic is fine as we are ultimately using a React hook.
export function useUrlPosition() {
  const [searchParams] = useSearchParams(); //data from url
  const lat = searchParams.get("lat");
  const lng = searchParams.get("lng");

  return [lat, lng];
}
