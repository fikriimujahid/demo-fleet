import Link from 'next/link';

const LandingPage = ({ currentUser, bookings }) => {
  const bookingList = bookings.map((booking) => {
    return (
      <tr key={booking.id}>
        <td>{booking.price}</td>
        <td>
          <Link href="/bookings/[bookingId]" as={`/bookings/${booking.id}`}>
            <a>View</a>
          </Link>
        </td>
      </tr>
    );
  });

  return (
    <div>
      <h1>Bookings</h1>
      <table className="table">
        <thead>
          <tr>
            <th>Price</th>
            <th>Link</th>
          </tr>
        </thead>
        <tbody>{bookingList}</tbody>
      </table>
    </div>
  );
};

LandingPage.getInitialProps = async (context, client, currentUser) => {
  const { data } = await client.get('/v1/bookings');

  return { bookings: data };
};

export default LandingPage;
