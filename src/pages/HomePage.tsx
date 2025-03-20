
import React from 'react';
import { Outlet } from 'react-router-dom';
import HomeIndex from './HomeIndex';

const HomePage = () => {
  return (
    <div>
      <Outlet />
    </div>
  );
};

export default HomePage;
