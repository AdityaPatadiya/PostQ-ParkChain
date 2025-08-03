import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import BookingForm from "./BookingForm";
import "leaflet-defaulticon-compatibility";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";

const UserDashboard = () => {
  const [plots, setPlots] = useState([]);
  const [selectedPlot, setSelectedPlot] = useState(null);

  useEffect(() => {
    const fetchPlots = async () => {
      const snapshot = await getDocs(collection(db, "parkingPlots"));
      const plotsData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setPlots(plotsData);
    };
    fetchPlots();
  }, []);

  return (
    <div>
      <MapContainer center={[22.3039, 70.8022]} zoom={13} style={{ height: "90vh" }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />
        {plots.map((plot) => (
          <Marker
            key={plot.id}
            position={[plot.location.lat, plot.location.lng]}
            eventHandlers={{ click: () => setSelectedPlot(plot) }}
          >
            <Popup>{plot.plotName}</Popup>
          </Marker>
        ))}
      </MapContainer>

      {selectedPlot && (
        <BookingForm
          plot={selectedPlot}
          onClose={() => setSelectedPlot(null)}
        />
      )}
    </div>
  );
};

export default UserDashboard;
