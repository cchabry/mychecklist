
import React from 'react';
import { useOperationMode } from '@/services/operationMode';
import { 
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel
} from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { 
  Slider
} from '@/components/ui/slider';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { toast } from 'sonner';
import { Info, Settings } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

// Schéma de validation pour le formulaire des paramètres
const settingsSchema = z.object({
  autoSwitchEnabled: z.boolean().default(true),
  failuresThreshold: z.number().min(1).max(10).default(3),
  errorHandling: z.enum(['auto', 'manual']).default('auto'),
  autoSwitchOnErrors: z.boolean().default(true),
});

type SettingsFormValues = z.infer<typeof settingsSchema>;

// Composant bouton pour afficher les paramètres dans une popover
export const OperationModeSettingsButton: React.FC<{ 
  className?: string,
  label?: string 
}> = ({ className = '', label = 'Paramètres' }) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className={className}>
          <Settings size={16} className="mr-2" />
          {label}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <h3 className="font-medium mb-2">Paramètres du mode opérationnel</h3>
        <OperationModeSettings />
      </PopoverContent>
    </Popover>
  );
};

// Composant principal pour les paramètres du mode opérationnel
const OperationModeSettings: React.FC = () => {
  const { settings, updateSettings } = useOperationMode();
  
  // Initialiser le formulaire avec les paramètres actuels
  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      autoSwitchEnabled: settings.autoSwitchEnabled,
      failuresThreshold: settings.failuresThreshold,
      errorHandling: settings.errorHandling,
      autoSwitchOnErrors: settings.autoSwitchOnErrors
    }
  });
  
  // Gérer la soumission du formulaire
  const onSubmit = (values: SettingsFormValues) => {
    updateSettings(values);
    toast.success('Paramètres mis à jour');
  };
  
  // Mettre à jour les paramètres à chaque changement
  const handleValueChange = (field: keyof SettingsFormValues, value: any) => {
    form.setValue(field, value);
    // Appliquer immédiatement les changements
    const currentValues = form.getValues();
    updateSettings({ ...currentValues, [field]: value });
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="autoSwitchEnabled"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Basculement automatique</FormLabel>
                <FormDescription>
                  Activer le mode démo automatiquement après plusieurs échecs
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={(value) => handleValueChange('autoSwitchEnabled', value)}
                />
              </FormControl>
            </FormItem>
          )}
        />
        
        {form.watch('autoSwitchEnabled') && (
          <FormField
            control={form.control}
            name="failuresThreshold"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel>Nombre d'échecs avant basculement</FormLabel>
                <div className="flex items-center gap-2">
                  <FormControl>
                    <Slider
                      value={[field.value]}
                      min={1}
                      max={10}
                      step={1}
                      onValueChange={(value) => handleValueChange('failuresThreshold', value[0])}
                    />
                  </FormControl>
                  <span className="w-8 text-center">{field.value}</span>
                </div>
                <FormDescription>
                  Nombre d'erreurs consécutives avant de basculer en mode démo
                </FormDescription>
              </FormItem>
            )}
          />
        )}
        
        <FormField
          control={form.control}
          name="errorHandling"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Gestion des erreurs</FormLabel>
                <FormDescription>
                  Mode de gestion des erreurs de connexion
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value === 'auto'}
                  onCheckedChange={(value) => handleValueChange('errorHandling', value ? 'auto' : 'manual')}
                />
              </FormControl>
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="autoSwitchOnErrors"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Notifications</FormLabel>
                <FormDescription>
                  Afficher des notifications lors des changements de mode
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={(value) => handleValueChange('autoSwitchOnErrors', value)}
                />
              </FormControl>
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
};

export default OperationModeSettings;
