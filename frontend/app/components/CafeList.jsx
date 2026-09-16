'use client';

const CafeList = ({ cafes, onEdit, onDelete }) => {
  if (!cafes || cafes.length === 0) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
        <p>No cafes found. Add your first cafe!</p>
      </div>
    );
  }

  const formatEnvironment = (env) => {
    if (!env) return '-';
    const parts = [];
    if (env.noiseLevel) parts.push(`Noise: ${env.noiseLevel}`);
    if (env.seatingType) parts.push(`Seating: ${env.seatingType}`);
    if (env.hasAC) parts.push('AC');
    if (env.hasOutdoorSeating) parts.push('Outdoor');
    if (env.wifiSpeed) parts.push(`WiFi: ${env.wifiSpeed}`);
    return parts.join(' • ');
  };

  return (
    <div className="card table-container">
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>City / Area</th>
            <th>Specialties</th>
            <th>Environment</th>
            <th>Price</th>
            <th>WiFi</th>
            <th>Rating</th>
            <th>Tags</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {cafes.map((cafe) => (
            <tr key={cafe._id}>
              <td style={{ fontWeight: 500 }}>{cafe.name}</td>
              <td>
                {cafe.city}
                {cafe.area && <span style={{ color: '#666', marginLeft: '8px' }}>{cafe.area}</span>}
              </td>
              <td>
                {cafe.foodSpecialties && cafe.foodSpecialties.length > 0 ? (
                  cafe.foodSpecialties.map((s, i) => (
                    <span key={i} className="badge badge-info">{s}</span>
                  ))
                ) : (
                  '-'
                )}
              </td>
              <td>
                <div className="environment-summary">{formatEnvironment(cafe.environment)}</div>
              </td>
              <td>{cafe.avgPricePerPerson ? `₹${cafe.avgPricePerPerson}` : '-'}</td>
              <td>
                {cafe.wifiQuality !== undefined && (
                  <span className="badge badge-success">
                    {'★'.repeat(cafe.wifiQuality)}{'☆'.repeat(5 - cafe.wifiQuality)}
                  </span>
                )}
              </td>
              <td>
                {cafe.rating !== undefined && (
                  <span className="badge badge-warning">
                    {'★'.repeat(Math.round(cafe.rating))}{'☆'.repeat(5 - Math.round(cafe.rating))}
                    {' '}{cafe.rating.toFixed(1)}
                  </span>
                )}
              </td>
              <td>
                {cafe.ambienceTags && cafe.ambienceTags.length > 0 ? (
                  cafe.ambienceTags.map((tag, i) => (
                    <span key={i} className="badge badge-info">{tag}</span>
                  ))
                ) : (
                  '-'
                )}
              </td>
              <td>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => onEdit(cafe)}
                  >
                    Edit
                  </button>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => {
                      if (confirm('Are you sure you want to delete this cafe?')) {
                        onDelete(cafe._id);
                      }
                    }}
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CafeList;