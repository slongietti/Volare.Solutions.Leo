import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';

const Home: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="home">
      <h1>Welcome to Leonardo's World 👶</h1>
      <div className="button-container">
        <button 
          className="action-button" 
          onClick={() => navigate('/crib-cam')}
        >
          Crib Cam 👶
        </button>
      </div>
    </div>
  );
};

export default Home;