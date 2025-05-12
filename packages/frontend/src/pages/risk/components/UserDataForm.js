import React, { useState } from 'react';

const UserDataForm = ({ onSubmit }) => {
  const [userData, setUserData] = useState({
    age: '',
    location: '',
    healthStatus: 'Bueno',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData({ ...userData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(userData);
  };

  return (
    <form onSubmit={handleSubmit} className="user-data-form">
      <h2>Datos Personales</h2>
      <div>
        <label>Edad:</label>
        <input
          type="number"
          name="age"
          value={userData.age}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <label>Ubicación:</label>
        <input
          type="text"
          name="location"
          value={userData.location}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <label>Estado de Salud:</label>
        <select name="healthStatus" value={userData.healthStatus} onChange={handleChange}>
          <option value="Bueno">Bueno</option>
          <option value="Regular">Regular</option>
          <option value="Malo">Malo</option>
        </select>
      </div>
      <button type="submit">Continuar</button>
    </form>
  );
};

export default UserDataForm;
