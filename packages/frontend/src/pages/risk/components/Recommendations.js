import React from 'react';

const Recommendations = ({ recommendations }) => {
  return (
    <div className="recommendations">
      <h3>Recomendaciones</h3>
      <ul>
        {recommendations.map((rec, index) => (
          <li key={index}>{rec}</li>
        ))}
      </ul>
    </div>
  );
};

export default Recommendations;
