// // src/pages/PaymentDashboard.jsx
// import React, { useState, useEffect } from "react";
// import { collection, getDocs, query, orderBy, where, limit } from "firebase/firestore";
// import { db } from "../firebase";

// const PaymentDashboard = () => {
//   const [payments, setPayments] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [filter, setFilter] = useState("all"); // all, today, week, month
//   const [searchVehicle, setSearchVehicle] = useState("");
//   const [stats, setStats] = useState({
//     totalRevenue: 0,
//     totalTransactions: 0,
//     avgTicketSize: 0,
//     overtimePenalties: 0
//   });

//   useEffect(() => {
//     fetchPayments();
//   }, [filter]);

//   const fetchPayments = async () => {
//     setLoading(true);
//     try {
//       let paymentsQuery = query(
//         collection(db, "payments"),
//         orderBy("paidAt", "desc")
//       );

//       // Apply date filter
//       if (filter !== "all") {
//         const now = new Date();
//         let startDate;
        
//         switch (filter) {
//           case "today":
//             startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
//             break;
//           case "week":
//             startDate = new Date(now - 7 * 24 * 60 * 60 * 1000);
//             break;
//           case "month":
//             startDate = new Date(now.getFullYear(), now.getMonth(), 1);
//             break;
//           default:
//             startDate = null;
//         }
        
//         if (startDate) {
//           paymentsQuery = query(
//             collection(db, "payments"),
//             where("paidAt", ">=", startDate.toISOString()),
//             orderBy("paidAt", "desc"),
//             limit(100)
//           );
//         }
//       }

//       const snapshot = await getDocs(paymentsQuery);
//       const paymentData = snapshot.docs.map(doc => ({
//         id: doc.id,
//         ...doc.data()
//       }));

//       setPayments(paymentData);
//       calculateStats(paymentData);
//     } catch (error) {
//       console.error("Error fetching payments:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const calculateStats = (paymentData) => {
//     const totalRevenue = paymentData.reduce((sum, payment) => sum + payment.totalAmount, 0);
//     const totalTransactions = paymentData.length;
//     const avgTicketSize = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;
//     const overtimePenalties = paymentData.reduce((sum, payment) => sum + (payment.penaltyAmount || 0), 0);

//     setStats({
//       totalRevenue: Math.round(totalRevenue),
//       totalTransactions,
//       avgTicketSize: Math.round(avgTicketSize),
//       overtimePenalties: Math.round(overtimePenalties)
//     });
//   };

//   const filteredPayments = payments.filter(payment => 
//     searchVehicle === "" || 
//     payment.vehicleNumber?.toLowerCase().includes(searchVehicle.toLowerCase())
//   );

//   const formatTime = (dateString) => {
//     return new Date(dateString).toLocaleString('en-IN', {
//       day: '2-digit',
//       month: '2-digit',
//       year: 'numeric',
//       hour: '2-digit',
//       minute: '2-digit'
//     });
//   };

//   const formatDuration = (hours) => {
//     const h = Math.floor(hours);
//     const m = Math.floor((hours - h) * 60);
//     return `${h}h ${m}m`;
//   };

//   const getPaymentMethodIcon = (method) => {
//     const icons = {
//       cash: "💵",
//       card: "💳",
//       upi: "📱",
//       wallet: "👛"
//     };
//     return icons[method] || "💰";
//   };

//   const exportToCSV = () => {
//     const headers = ["Date", "Vehicle", "User", "Plot", "Duration", "Base Amount", "Penalty", "Total", "Method"];
//     const csvData = filteredPayments.map(payment => [
//       formatTime(payment.paidAt),
//       payment.vehicleNumber,
//       payment.userName,
//       payment.plotName,
//       formatDuration(payment.actualDurationHours),
//       payment.basePayment,
//       payment.penaltyAmount || 0,
//       payment.totalAmount,
//       payment.paymentMethod
//     ]);

//     const csvContent = [headers, ...csvData]
//       .map(row => row.map(cell => `"${cell}"`).join(","))
//       .join("\n");

//     const blob = new Blob([csvContent], { type: "text/csv" });
//     const url = window.URL.createObjectURL(blob);
//     const a = document.createElement("a");
//     a.href = url;
//     a.download = `payments_${filter}_${new Date().toISOString().split('T')[0]}.csv`;
//     a.click();
//     window.URL.revokeObjectURL(url);
//   };

//   return (
//     <div style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
//       <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" }}>
//         <h2 style={{ color: "#2c3e50", margin: 0 }}>💰 Payment Dashboard</h2>
//         <button
//           onClick={exportToCSV}
//           style={{
//             padding: "10px 20px",
//             background: "#17a2b8",
//             color: "white",
//             border: "none",
//             borderRadius: "5px",
//             cursor: "pointer"
//           }}
//         >
//           📊 Export CSV
//         </button>
//       </div>

//       {/* Stats Cards */}
//       <div style={{ 
//         display: "grid", 
//         gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", 
//         gap: "20px", 
//         marginBottom: "30px" 
//       }}>
//         <div style={{ 
//           background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", 
//           color: "white", 
//           padding: "20px", 
//           borderRadius: "10px", 
//           textAlign: "center" 
//         }}>
//           <h3 style={{ margin: "0 0 10px 0", fontSize: "16px" }}>Total Revenue</h3>
//           <p style={{ margin: 0, fontSize: "24px", fontWeight: "bold" }}>₹{stats.totalRevenue.toLocaleString()}</p>
//         </div>
        
//         <div style={{ 
//           background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)", 
//           color: "white", 
//           padding: "20px", 
//           borderRadius: "10px", 
//           textAlign: "center" 
//         }}>
//           <h3 style={{ margin: "0 0 10px 0", fontSize: "16px" }}>Transactions</h3>
//           <p style={{ margin: 0, fontSize: "24px", fontWeight: "bold" }}>{stats.totalTransactions}</p>
//         </div>
        
//         <div style={{ 
//           background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)", 
//           color: "white", 
//           padding: "20px", 
//           borderRadius: "10px", 
//           textAlign: "center" 
//         }}>
//           <h3 style={{ margin: "0 0 10px 0", fontSize: "16px" }}>Avg. Ticket</h3>
//           <p style={{ margin: 0, fontSize: "24px", fontWeight: "bold" }}>₹{stats.avgTicketSize}</p>
//         </div>
        
//         <div style={{ 
//           background: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)", 
//           color: "white", 
//           padding: "20px", 
//           borderRadius: "10px", 
//           textAlign: "center" 
//         }}>
//           <h3 style={{ margin: "0 0 10px 0", fontSize: "16px" }}>Penalty Revenue</h3>
//           <p style={{ margin: 0, fontSize: "24px", fontWeight: "bold" }}>₹{stats.overtimePenalties.toLocaleString()}</p>
//         </div>
//       </div>

//       {/* Filters */}
//       <div style={{ 
//         display: "flex", 
//         gap: "15px", 
//         alignItems: "center", 
//         marginBottom: "20px",
//         flexWrap: "wrap"
//       }}>
//         <div>
//           <label style={{ marginRight: "8px", fontWeight: "bold" }}>Period:</label>
//           <select
//             value={filter}
//             onChange={(e) => setFilter(e.target.value)}
//             style={{
//               padding: "8px 12px",
//               border: "1px solid #ddd",
//               borderRadius: "5px",
//               fontSize: "14px"
//             }}
//           >
//             <option value="all">All Time</option>
//             <option value="today">Today</option>
//             <option value="week">This Week</option>
//             <option value="month">This Month</option>
//           </select>
//         </div>

//         <div>
//           <label style={{ marginRight: "8px", fontWeight: "bold" }}>Search Vehicle:</label>
//           <input
//             type="text"
//             placeholder="Enter vehicle number"
//             value={searchVehicle}
//             onChange={(e) => setSearchVehicle(e.target.value)}
//             style={{
//               padding: "8px 12px",
//               border: "1px solid #ddd",
//               borderRadius: "5px",
//               fontSize: "14px",
//               width: "200px"
//             }}
//           />
//         </div>
//       </div>

//       {/* Payments Table */}
//       {loading ? (
//         <div style={{ textAlign: "center", padding: "40px" }}>
//           <p>Loading payments...</p>
//         </div>
//       ) : (
//         <div style={{ 
//           background: "white", 
//           borderRadius: "10px", 
//           boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
//           overflow: "hidden"
//         }}>
//           <div style={{ overflowX: "auto" }}>
//             <table style={{ width: "100%", borderCollapse: "collapse" }}>
//               <thead>
//                 <tr style={{ backgroundColor: "#f8f9fa" }}>
//                   <th style={tableHeaderStyle}>Date & Time</th>
//                   <th style={tableHeaderStyle}>Vehicle</th>
//                   <th style={tableHeaderStyle}>User</th>
//                   <th style={tableHeaderStyle}>Plot</th>
//                   <th style={tableHeaderStyle}>Duration</th>
//                   <th style={tableHeaderStyle}>Base</th>
//                   <th style={tableHeaderStyle}>Penalty</th>
//                   <th style={tableHeaderStyle}>Total</th>
//                   <th style={tableHeaderStyle}>Method</th>
//                   <th style={tableHeaderStyle}>Status</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {filteredPayments.map((payment, index) => (
//                   <tr key={payment.id} style={{ 
//                     backgroundColor: index % 2 === 0 ? "white" : "#f8f9fa",
//                     borderBottom: "1px solid #dee2e6"
//                   }}>
//                     <td style={tableCellStyle}>{formatTime(payment.paidAt)}</td>
//                     <td style={{...tableCellStyle, fontWeight: "bold", color: "#007bff"}}>
//                       {payment.vehicleNumber}
//                     </td>
//                     <td style={tableCellStyle}>{payment.userName}</td>
//                     <td style={tableCellStyle}>{payment.plotName}</td>
//                     <td style={tableCellStyle}>
//                       <div>
//                         <small style={{ color: "#666" }}>
//                           Booked: {formatDuration(payment.bookedDurationHours)}
//                         </small><br/>
//                         <span>Actual: {formatDuration(payment.actualDurationHours)}</span>
//                       </div>
//                     </td>
//                     <td style={tableCellStyle}>₹{payment.basePayment}</td>
//                     <td style={{...tableCellStyle, color: payment.penaltyAmount > 0 ? "#dc3545" : "#666"}}>
//                       ₹{payment.penaltyAmount || 0}
//                       {payment.overtimeHours > 0 && (
//                         <small style={{ display: "block", color: "#dc3545" }}>
//                           +{formatDuration(payment.overtimeHours)} OT
//                         </small>
//                       )}
//                     </td>
//                     <td style={{...tableCellStyle, fontWeight: "bold", color: "#28a745"}}>
//                       ₹{payment.totalAmount}
//                       {payment.discount > 0 && (
//                         <small style={{ display: "block", color: "#28a745" }}>
//                           (₹{payment.discount} saved)
//                         </small>
//                       )}
//                     </td>
//                     <td style={tableCellStyle}>
//                       <span style={{ display: "flex", alignItems: "center", gap: "5px" }}>
//                         {getPaymentMethodIcon(payment.paymentMethod)}
//                         <span style={{ textTransform: "capitalize", fontSize: "12px" }}>
//                           {payment.paymentMethod}
//                         </span>
//                       </span>
//                     </td>
//                     <td style={tableCellStyle}>
//                       <span style={{
//                         padding: "4px 8px",
//                         borderRadius: "12px",
//                         fontSize: "11px",
//                         fontWeight: "bold",
//                         backgroundColor: payment.paymentStatus === "completed" ? "#d4edda" : "#f8d7da",
//                         color: payment.paymentStatus === "completed" ? "#155724" : "#721c24"
//                       }}>
//                         {payment.paymentStatus === "completed" ? "✅ Paid" : "❌ Failed"}
//                       </span>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>

//           {filteredPayments.length === 0 && (
//             <div style={{ textAlign: "center", padding: "40px", color: "#666" }}>
//               <p>No payments found for the selected criteria.</p>
//             </div>
//           )}
//         </div>
//       )}

//       {/* Summary Section */}
//       {filteredPayments.length > 0 && (
//         <div style={{ 
//           marginTop: "30px", 
//           padding: "20px", 
//           background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
//           borderRadius: "10px",
//           color: "white"
//         }}>
//           <h4 style={{ margin: "0 0 15px 0" }}>📊 Summary for {filter === "all" ? "All Time" : filter}</h4>
//           <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "15px" }}>
//             <div>
//               <strong>Total Transactions:</strong><br/>
//               {filteredPayments.length}
//             </div>
//             <div>
//               <strong>Total Revenue:</strong><br/>
//               ₹{filteredPayments.reduce((sum, p) => sum + p.totalAmount, 0).toLocaleString()}
//             </div>
//             <div>
//               <strong>Penalty Revenue:</strong><br/>
//               ₹{filteredPayments.reduce((sum, p) => sum + (p.penaltyAmount || 0), 0).toLocaleString()}
//             </div>
//             <div>
//               <strong>Avg Transaction:</strong><br/>
//               ₹{Math.round(filteredPayments.reduce((sum, p) => sum + p.totalAmount, 0) / filteredPayments.length || 0)}
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// // Styles
// const tableHeaderStyle = {
//   padding: "12px 8px",
//   textAlign: "left",
//   fontWeight: "bold",
//   fontSize: "12px",
//   color: "#495057",
//   borderBottom: "2px solid #dee2e6"
// };

// const tableCellStyle = {
//   padding: "10px 8px",
//   fontSize: "12px",
//   verticalAlign: "top"
// };

// export default PaymentDashboard;

// src/pages/AllBookings.jsx
import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";

const PaymentDashboard = () => {
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "bookings"));
        const bookingList = querySnapshot.docs.map((doc) => {
          const data = doc.data();

          const startTime = data.countdownStart
            ? data.countdownStart.toDate().toLocaleString()
            : "-";
          const endTime = data.billTime
            ? data.billTime.toDate().toLocaleString()
            : "-";

          const bookedHours = data.initialDuration || 0;

          // Calculate total usage in hours (actual parking duration)
          let totalUsageHours = bookedHours;
          if (data.countdownStart && data.billTime) {
            const start = data.countdownStart.toDate();
            const end = data.billTime.toDate();
            totalUsageHours = ((end - start) / 3600000).toFixed(2); // milliseconds to hours
          }

          const overtimeHours =
            totalUsageHours > bookedHours
              ? (totalUsageHours - bookedHours).toFixed(2)
              : 0;

          const totalCost = data.billAmount || 0;

          return {
            id: doc.id,
            email: data.userEmail,
            startTime,
            endTime,
            bookedHours,
            totalHours: totalUsageHours, // show actual usage hours
            overtimeHours,
            totalCost,
            paymentStatus: data.paymentStatus || "pending",
          };
        });

        setBookings(bookingList);
      } catch (error) {
        console.error("Error fetching bookings:", error);
      }
    };

    fetchBookings();
  }, []);

  return (
    <div className="p-5">
      <h1 className="text-2xl font-bold mb-6">All Bookings</h1>

      <div className="overflow-x-auto">
        <table className="min-w-full border rounded">
          <thead className="bg-gray-200">
            <tr>
              <th className="px-4 py-2 border">User Email</th>
              <th className="px-4 py-2 border">Start Time</th>
              <th className="px-4 py-2 border">End Time</th>
              <th className="px-4 py-2 border">Booked Hours</th>
              <th className="px-4 py-2 border">Usage Hours</th>
              <th className="px-4 py-2 border">Overtime</th>
              <th className="px-4 py-2 border">Total Cost (₹)</th>
              <th className="px-4 py-2 border">Payment Status</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((booking) => (
              <tr key={booking.id} className="text-center border-b">
                <td className="px-4 py-2 border">{booking.email}</td>
                <td className="px-4 py-2 border">{booking.startTime}</td>
                <td className="px-4 py-2 border">{booking.endTime}</td>
                <td className="px-4 py-2 border">{booking.bookedHours}</td>
                <td className="px-4 py-2 border">{booking.totalHours}</td>
                <td className="px-4 py-2 border">{booking.overtimeHours}</td>
                <td className="px-4 py-2 border">{booking.totalCost}</td>
                <td
                  className={`px-4 py-2 border font-bold ${
                    booking.paymentStatus === "completed"
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {booking.paymentStatus}
                </td>
              </tr>
            ))}
            {bookings.length === 0 && (
              <tr>
                <td colSpan="8" className="py-4 text-center">
                  No bookings found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PaymentDashboard;
