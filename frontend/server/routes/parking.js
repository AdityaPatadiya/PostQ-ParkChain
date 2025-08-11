import React, { useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import { db } from "../firebase";
import { collection, addDoc } from "firebase/firestore";
import "leaflet/dist/leaflet.css";

const AdminDashboard = () => {
  const [selectedPosition, setSelectedPosition] = useState(null);
  const [formData, setFormData] = useState({
    plotName: "",
    totalSlots: 0,
    slots: {
      small_ev: { count: 0, price: 0 },
      small_general: { count: 0, price: 0 },
      compact_ev: { count: 0, price: 0 },
      compact_general: { count: 0, price: 0 },
      large_ev: { count: 0, price: 0 },
      large_general: { count: 0, price: 0 },
    },
  });

  const MapClickHandler = () => {
    useMapEvents({
      click(e) {
        setSelectedPosition([e.latlng.lat, e.latlng.lng]);
      },
    });
    return null;
  };

  const handleChange = (section, type, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [type]: {
          ...prev[section][type],
          [field]: Number(value),
        },
      },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedPosition) {
      alert("Please select a location on the map.");
      return;
    }

    const totalAssigned = Object.values(formData.slots).reduce((sum, s) => sum + s.count, 0);

    if (totalAssigned > formData.totalSlots) {
      alert(`Total assigned slots (${totalAssigned}) exceed total available slots (${formData.totalSlots}).`);
      return;
    }

    try {
      await addDoc(collection(db, "parkingPlots"), {
        plotName: formData.plotName,
        totalSlots: formData.totalSlots,
        location: {
          lat: selectedPosition[0],
          lng: selectedPosition[1],
        },
        slots: formData.slots,
        createdAt: new Date(),
      });

      alert("Parking plot added successfully!");
      setFormData({
        plotName: "",
        totalSlots: 0,
        slots: {
          small_ev: { count: 0, price: 0 },
          small_general: { count: 0, price: 0 },
          compact_ev: { count: 0, price: 0 },
          compact_general: { count: 0, price: 0 },
          large_ev: { count: 0, price: 0 },
          large_general: { count: 0, price: 0 },
        },
      });
      setSelectedPosition(null);
    } catch (error) {
      console.error("Error adding parking plot:", error);
      alert("Failed to add parking plot");
    }
  };

  return (
    <div className="container mt-4">
      <h2 className="text-center mb-3">Admin Panel - Add Parking Plot</h2>

      <div style={{ height: "400px", marginBottom: "20px" }}>
        <MapContainer center={[22.3039, 70.8022]} zoom={13} style={{ height: "100%", width: "100%" }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapClickHandler />
          {selectedPosition && <Marker position={selectedPosition} />}
        </MapContainer>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label>Parking Plot Name</label>
          <input
            type="text"
            className="form-control"
            value={formData.plotName}
            onChange={(e) => setFormData({ ...formData, plotName: e.target.value })}
            required
          />
        </div>

        <div className="mb-3">
          <label>Total Slots</label>
          <input
            type="number"
            className="form-control"
            value={formData.totalSlots}
            onChange={(e) => setFormData({ ...formData, totalSlots: Number(e.target.value) })}
            required
          />
        </div>

        <h5>Slot Types by Size and Reservation</h5>
        {[
          { key: "small_ev", label: "Small - EV" },
          { key: "small_general", label: "Small - General" },
          { key: "compact_ev", label: "Compact - EV" },
          { key: "compact_general", label: "Compact - General" },
          { key: "large_ev", label: "Large - EV" },
          { key: "large_general", label: "Large - General" },
        ].map((slot) => (
          <div key={slot.key} className="mb-2 row">
            <div className="col-4">
              <label>{slot.label} Count</label>
              <input
                type="number"
                className="form-control"
                placeholder="Count"
                value={formData.slots[slot.key].count}
                onChange={(e) => handleChange("slots", slot.key, "count", e.target.value)}
              />
            </div>
            <div className="col-4">
              <label>Price (₹/hr)</label>
              <input
                type="number"
                className="form-control"
                placeholder="Price"
                value={formData.slots[slot.key].price}
                onChange={(e) => handleChange("slots", slot.key, "price", e.target.value)}
              />
            </div>
          </div>
        ))}

        <button type="submit" className="btn btn-success mt-3 w-100">Add Parking Plot</button>
      </form>
    </div>
  );
};

export default AdminDashboard;