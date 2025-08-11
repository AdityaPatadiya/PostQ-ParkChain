import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import "../css/MapView.css";

// Fix Leaflet default marker icons in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

const MapView = () => {
  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "parkingPlots"));
        const data = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setLocations(data);

        // Auto-select first location for details panel
        if (data.length > 0) {
          setSelectedLocation(data[0]);
        }
      } catch (error) {
        console.error("Error fetching locations: ", error);
      }
    };

    fetchLocations();
  }, []);

  const defaultCenter = [22.3039, 70.8022]; // Rajkot default

  return (
    <div className="map-page">
      {/* Map Section */}
      <div className="map-section">
        <MapContainer center={defaultCenter} zoom={13} style={{ height: "100%", width: "100%" }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {locations.map((loc) => {
            const position = [loc.location.lat, loc.location.lng];
            return (
              <Marker
                key={loc.id}
                position={position}
                eventHandlers={{
                  click: () => {
                    setSelectedLocation(loc);
                  },
                }}
              >
        
              </Marker>
            );
          })}
        </MapContainer>
      </div>

      {/* Details Section */}
      <div className="details-section">
        {selectedLocation ? (
          <>
            <h2>{selectedLocation.plotName || "Parking Location"}</h2>
            <p><strong>Address:</strong> {selectedLocation.address || "Not available"}</p>

            <h4>Available Slots</h4>
            <table className="slots-table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Count</th>
                  <th>Price</th>
                </tr>
              </thead>
              <tbody>
                {selectedLocation.slots &&
                  Object.entries(selectedLocation.slots).map(([type, details]) => (
                    <tr key={type}>
                      <td>{type.replace(/_/g, " ")}</td>
                      <td>{details.count}</td>
                      <td>₹{details.price}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </>
        ) : (
          <p>Select a marker on the map to view details.</p>
        )}
      </div>
    </div>
  );
};

export default MapView;
