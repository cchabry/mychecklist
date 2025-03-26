
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useNotionAPI } from '@/hooks/notion/useNotionAPI';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

interface User {
  id: string;
  name: string;
  avatar_url: string;
  type: string;
}

const NotionAPIExample: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const { execute, isLoading, lastError } = useNotionAPI();

  const fetchUser = async () => {
    try {
      const data = await execute<{ bot: User }>('/v1/users/me');
      setUser(data.bot);
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'utilisateur:', error);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Exemple d'utilisation de l'API Notion</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Button onClick={fetchUser} disabled={isLoading} className="w-full">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Chargement...
              </>
            ) : (
              'Charger les infos utilisateur'
            )}
          </Button>

          {user && (
            <div className="p-4 bg-slate-50 rounded-md">
              <div className="flex items-center space-x-3">
                {user.avatar_url && (
                  <img
                    src={user.avatar_url}
                    alt="User avatar"
                    className="h-10 w-10 rounded-full"
                  />
                )}
                <div>
                  <p className="font-medium">{user.name}</p>
                  <p className="text-sm text-gray-500">ID: {user.id}</p>
                  <p className="text-sm text-gray-500">Type: {user.type}</p>
                </div>
              </div>
            </div>
          )}

          {lastError && (
            <div className="p-4 bg-red-50 text-red-800 rounded-md text-sm">
              <p className="font-medium">Erreur:</p>
              <p>{lastError.message}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default NotionAPIExample;
