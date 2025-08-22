import React, { useEffect, useState } from 'react';

const demoBookings = [
	{
		id: 1,
		slot: 'A1',
		date: '2025-08-22',
		time: '10:00 - 12:00',
		status: 'Confirmed',
	},
	{
		id: 2,
		slot: 'B2',
		date: '2025-08-23',
		time: '14:00 - 16:00',
		status: 'Pending',
	},
];

function MyBookings() {
	const [bookings, setBookings] = useState([]);

	useEffect(() => {
		// Simulate fetching bookings
		setBookings(demoBookings);
	}, []);

	return (
		<div style={{ padding: '2rem' }}>
			<h2>My Bookings</h2>
			{bookings.length === 0 ? (
				<p>No bookings found.</p>
			) : (
				<table style={{ width: '100%', borderCollapse: 'collapse' }}>
					<thead>
						<tr>
							<th>Slot</th>
							<th>Date</th>
							<th>Time</th>
							<th>Status</th>
						</tr>
					</thead>
					<tbody>
						{bookings.map((booking) => (
							<tr key={booking.id}>
								<td>{booking.slot}</td>
								<td>{booking.date}</td>
								<td>{booking.time}</td>
								<td>{booking.status}</td>
							</tr>
						))}
					</tbody>
				</table>
			)}
		</div>
	);
}

export default MyBookings;
