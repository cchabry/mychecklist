
import React from 'react';
import { useParams } from 'react-router-dom';

const ProjectPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-semibold mb-4">Projet {projectId}</h1>
      <p>Cette page est temporaire pour permettre la compilation.</p>
    </div>
  );
};

export default ProjectPage;
