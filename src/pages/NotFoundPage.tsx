
import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage: React.FC = () => {
  return (
    <div className="container mx-auto py-16 text-center">
      <h1 className="text-4xl font-bold mb-4">404</h1>
      <p className="text-xl mb-8">Page non trouvée</p>
      <Link to="/" className="text-blue-500 hover:underline">
        Retour à l'accueil
      </Link>
    </div>
  );
};

export default NotFoundPage;
