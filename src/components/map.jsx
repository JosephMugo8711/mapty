import { useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useRef, useState, useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Popup,
  useMap,
  GeoJSON,
  FeatureGroup,
  useMapEvent,
} from "react-leaflet";
import { EditControl } from "react-leaflet-draw";
import "leaflet-draw/dist/leaflet.draw.css";
import "leaflet/dist/leaflet.css";

import PropTypes from "prop-types"; // Import for prop type validation

import { getCoords, setGeoData, setShowForm } from "../features/app/appSlice";
import { getExerciseById } from "../features/exercise/exerciseSlice";
import { useUrlPosition } from "../hooks/useUrlPosition";
import { formatDate } from "../utils/helpers";

export default function Map({ mapRef }) {
  const [searchParams] = useSearchParams();
  const exerciseId = searchParams.get("id");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const popupRef = useRef(null);

  const { coords: geoCords, status } = useSelector((state) => state.app);
  const exercise = exerciseId ? getExerciseById(useSelector((state) => state), exerciseId) : null;

  const [mapPosition, setMapPosition] = useState([40, 0]);
  const [mapLat, mapLng] = useUrlPosition();

  // Set map position based on URL or geoCords
  useEffect(() => {
    if (mapLat && mapLng) {
      setMapPosition([mapLat, mapLng]);
    } else if (geoCords) {
      setMapPosition(geoCords);
    }
  }, [mapLat, mapLng, geoCords]);

  // Auto-open popup when geoData is present
  useEffect(() => {
    const popup = popupRef.current;
    if (popup && geoData) {
      popup.openPopup();
    }
  }, [geoData]);

  // Button to get user position
  const handleGetPosition = () => {
    dispatch(getCoords());
  };

  return (
    <div className="map-container">
      {!geoCords && (
        <button className="btn btn--position" onClick={handleGetPosition}>
          {status === "loading" ? "Loading..." : "Use your position"}
        </button>
      )}
      <MapContainer center={mapPosition} zoom={13} scrollWheelZoom={true} id="map">
        <FeatureGroup ref={mapRef}>
          <EditControl
            position="topright"
            draw={{
              polyline: true,
              polygon: false,
              circle: false,
              rectangle: false,
              circlemarker: false,
              marker: false,
            }}
          />
        </FeatureGroup>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {exerciseId && exercise && (
          <GeoJSON
            ref={popupRef}
            key={exercise.id}
            data={exercise.geoData}
            style={{
              color: exercise.type === "running" ? "var(--color-brand--2)" : "var(--color-brand--1)",
              weight: 7,
            }}
          >
            <Popup className={`${exercise.type}-popup`}>
              <span>{`${exercise.type === "running" ? `🏃‍♂️ Running` : `🚴‍♀️ Cycling`} on ${formatDate(exercise.date)}, ${exercise.city} (${exercise.countryCode})`}</span>
            </Popup>
          </GeoJSON>
        )}
        <ChangeCenter position={mapPosition} />
        <DetectDraw />
      </MapContainer>
    </div>
  );
}

Map.propTypes = {
  mapRef: PropTypes.object.isRequired, // Validation for mapRef
};

function ChangeCenter({ position }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(position, 16);
  }, [map, position]);
  return null;
}

ChangeCenter.propTypes = {
  position: PropTypes.arrayOf(PropTypes.number).isRequired,
};

function DetectDraw() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const map = useMap();

  useMapEvent("draw:created", (e) => {
    const coordinates = e.layer._latlngs.map((latlng) => [latlng.lng, latlng.lat]);
    const totalDistance = coordinates.reduce((acc, point, i) => {
      if (i < coordinates.length - 1) {
        return acc + map.distance(point, coordinates[i + 1]);
      }
      return acc;
    }, 0);

    const geoJSON = {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          properties: {},
          geometry: {
            type: "LineString",
            coordinates,
          },
        },
      ],
    };

    dispatch(setGeoData(geoJSON));
    dispatch(setShowForm(true));
    navigate(`form?lat=${coordinates[0][1]}&lng=${coordinates[0][0]}&totalDistance=${totalDistance}`);
  });

  return null;
}
