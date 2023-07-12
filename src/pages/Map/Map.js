import React, { useState } from "react";
import {
  GoogleMap,
  InfoWindow,
  MarkerF,
  useLoadScript,
} from "@react-google-maps/api";
import "./Map.css";
import { Alert } from "@mui/material";
import Footer from "../../components/Footer";

const Googlemap = () => {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.REACT_APP_GOOGLEMAP_APIKEY,
    libraries: ["places"],
  });

  const [mapRef, setMapRef] = useState();
  const [isOpen, setIsOpen] = useState(false);
  const [infoWindowData, setInfoWindowData] = useState();

  const [error, setError] = useState("");
  //const [currlat, setCurrLat] = useState(0);
  //const [currLng, setCurrLng] = useState(0);

  function showError(error) {
    // eslint-disable-next-line default-case
    switch (error.code) {
      case error.PERMISSION_DENIED:
        setError("User denied the request for Geolocation.");
        break;
      case error.POSITION_UNAVAILABLE:
        setError("Location information is unavailable.");
        break;
      case error.TIMEOUT:
        setError("The request to get user location timed out.");
        break;
      case error.UNKNOWN_ERROR:
        setError("An unknown error occurred.");
        break;
    }
  }

  const markers = JSON.parse(localStorage.getItem("markers") || "[]");

  const onMapLoad = (map) => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(function (position) {
        let currLat = position.coords.latitude;
        let currLong = position.coords.longitude;
        let pyrmont = new window.google.maps.LatLng(currLat, currLong);

        let request = {
          location: pyrmont,
          radius: "500",
          type: ["supermarket"],
        };

        let service = new window.google.maps.places.PlacesService(map);
        const bounds = new window.google.maps.LatLngBounds();
        service.nearbySearch(request, (results, status) => {
          if (status === window.google.maps.places.PlacesServiceStatus.OK) {
            const superMarkers = results.map((result) => ({
              address: result.name,
              lat: result.geometry.location.lat(),
              lng: result.geometry.location.lng(),
            }));
            localStorage.setItem("markers", JSON.stringify(superMarkers));
          }
        });

        markers?.forEach(({ lat, lng }) => bounds.extend({ lat, lng }));
        map.fitBounds(bounds);
        setMapRef(map);
      }, showError);
    } else {
      setError("Geolocation is not supported by this browser.");
    }
  };

  const handleMarkerClick = (id, lat, lng, address) => {
    mapRef?.panTo({ lat, lng });
    setInfoWindowData({ id, address });
    setIsOpen(true);
  };

  return (
    <div className="map">
      <h1>Find the nearest supermarkets near your location</h1>
      {error !== "" && <Alert severity="error">{error}</Alert>}
      {!isLoaded ? (
        <h1>Loading...</h1>
      ) : (
        <GoogleMap
          mapContainerClassName="map-container"
          onLoad={onMapLoad}
          onClick={() => setIsOpen(false)}
        >
          {markers.map(({ address, lat, lng }, ind) => (
            <MarkerF
              key={ind}
              position={{ lat, lng }}
              onClick={() => {
                handleMarkerClick(ind, lat, lng, address);
              }}
            >
              {isOpen && infoWindowData?.id === ind && (
                <InfoWindow
                  onCloseClick={() => {
                    setIsOpen(false);
                  }}
                >
                  <h3>{infoWindowData.address}</h3>
                </InfoWindow>
              )}
            </MarkerF>
          ))}
        </GoogleMap>
      )}
      <Footer />
    </div>
  );
};

export default Googlemap;
