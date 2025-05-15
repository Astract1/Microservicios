import React, { useState, useEffect } from 'react';
import { useSpring, animated } from 'react-spring';

const UserDataForm = ({ onSubmit, initialData }) => {
  const [userData, setUserData] = useState({
    id: 1, // ID de usuario simulado
    age: '',
    location: '',
    healthStatus: 'Bueno',
    hasPreexistingConditions: false,
    preexistingConditions: '',
  });
  
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Animación para el formulario
  const formAnimation = useSpring({
    from: { opacity: 0, transform: 'translateY(20px)' },
    to: { opacity: 1, transform: 'translateY(0)' },
    config: { tension: 280, friction: 20 },
  });

  // Si hay datos iniciales, usarlos para inicializar el formulario
  useEffect(() => {
    if (initialData) {
      setUserData(prevData => ({
        ...prevData,
        ...initialData
      }));
    }
  }, [initialData]);

  const validateField = (name, value) => {
    let error = '';
    
    switch (name) {
      case 'age':
        if (!value) error = 'La edad es requerida';
        else if (value < 1 || value > 120) error = 'La edad debe estar entre 1 y 120 años';
        break;
      case 'location':
        if (!value) error = 'La ubicación es requerida';
        break;
      case 'preexistingConditions':
        if (userData.hasPreexistingConditions && !value) {
          error = 'Por favor, especifique las condiciones preexistentes';
        }
        break;
      default:
        break;
    }
    
    return error;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    
    setUserData(prevData => ({
      ...prevData,
      [name]: newValue
    }));
    
    // Validar el campo si ya fue tocado
    if (touched[name]) {
      setErrors(prevErrors => ({
        ...prevErrors,
        [name]: validateField(name, newValue)
      }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    
    setTouched(prevTouched => ({
      ...prevTouched,
      [name]: true
    }));
    
    setErrors(prevErrors => ({
      ...prevErrors,
      [name]: validateField(name, value)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validar todos los campos antes de enviar
    const formErrors = {};
    Object.keys(userData).forEach(key => {
      const error = validateField(key, userData[key]);
      if (error) formErrors[key] = error;
    });
    
    setErrors(formErrors);
    
    // Si no hay errores, enviar el formulario
    if (Object.keys(formErrors).length === 0) {
      onSubmit(userData);
    }
  };

  return (
    <animated.div className="form-container" style={formAnimation}>
      <form onSubmit={handleSubmit} className="user-data-form">
        <h2>Datos Personales</h2>
        <div className="form-group">
          <label htmlFor="age">Edad</label>
          <input
            type="number"
            id="age"
            name="age"
            value={userData.age}
            onChange={handleChange}
            onBlur={handleBlur}
            className={`form-control ${errors.age ? 'is-invalid' : ''}`}
            placeholder="Ingrese su edad"
            required
          />
          {errors.age && <span className="form-error">{errors.age}</span>}
        </div>
        
        <div className="form-group">
          <label htmlFor="location">Ubicación</label>
          <input
            type="text"
            id="location"
            name="location"
            value={userData.location}
            onChange={handleChange}
            onBlur={handleBlur}
            className={`form-control ${errors.location ? 'is-invalid' : ''}`}
            placeholder="Ciudad o área donde vive"
            required
          />
          {errors.location && <span className="form-error">{errors.location}</span>}
        </div>
        
        <div className="form-group">
          <label htmlFor="healthStatus">Estado de Salud</label>
          <select 
            id="healthStatus"
            name="healthStatus" 
            value={userData.healthStatus} 
            onChange={handleChange}
            className="form-control form-select"
          >
            <option value="Bueno">Bueno</option>
            <option value="Regular">Regular</option>
            <option value="Malo">Malo</option>
          </select>
        </div>
        
        <div className="form-group">
          <label className="form-checkbox">
            <input
              type="checkbox"
              name="hasPreexistingConditions"
              checked={userData.hasPreexistingConditions}
              onChange={handleChange}
            />
            <span>Tengo condiciones de salud preexistentes</span>
          </label>
        </div>
        
        {userData.hasPreexistingConditions && (
          <div className="form-group">
            <label htmlFor="preexistingConditions">Especifique sus condiciones</label>
            <textarea
              id="preexistingConditions"
              name="preexistingConditions"
              value={userData.preexistingConditions}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`form-control ${errors.preexistingConditions ? 'is-invalid' : ''}`}
              placeholder="Describa sus condiciones médicas preexistentes"
              rows="3"
            ></textarea>
            {errors.preexistingConditions && <span className="form-error">{errors.preexistingConditions}</span>}
          </div>
        )}
        
        <div className="form-actions">
          <button type="submit" className="btn btn-primary btn-icon">
            <i className="fas fa-arrow-right"></i>
            <span>Continuar</span>
          </button>
        </div>
      </form>
    </animated.div>
  );
};

export default UserDataForm;
