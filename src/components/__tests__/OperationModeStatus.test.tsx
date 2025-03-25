
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import OperationModeStatus from '../../components/OperationModeStatus';
import { useOperationMode } from '../../services/operationMode';
import { toast } from 'sonner';

// Mocks
jest.mock('../../services/operationMode', () => ({
  useOperationMode: jest.fn()
}));

jest.mock('sonner', () => ({
  toast: {
    info: jest.fn()
  }
}));

describe('OperationModeStatus Component', () => {
  const toggleMock = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Configuration par défaut du mock - mode réel
    (useOperationMode as jest.Mock).mockReturnValue({
      isDemoMode: false,
      toggle: toggleMock,
      switchReason: null
    });
  });
  
  it('should display real mode status correctly', () => {
    render(<OperationModeStatus />);
    
    expect(screen.getByText('Mode réel')).toBeInTheDocument();
  });
  
  it('should display demo mode status correctly', () => {
    (useOperationMode as jest.Mock).mockReturnValue({
      isDemoMode: true,
      toggle: toggleMock,
      switchReason: null
    });
    
    render(<OperationModeStatus />);
    
    expect(screen.getByText('Mode démo')).toBeInTheDocument();
  });
  
  it('should display switch reason indicator in demo mode', () => {
    (useOperationMode as jest.Mock).mockReturnValue({
      isDemoMode: true,
      toggle: toggleMock,
      switchReason: 'Test reason'
    });
    
    render(<OperationModeStatus />);
    
    // Un élément de type AlertTriangle devrait être présent
    const alertIcon = document.querySelector('[class*="text-amber-500"]');
    expect(alertIcon).toBeInTheDocument();
  });
  
  it('should not show toggle button by default', () => {
    render(<OperationModeStatus />);
    
    // Le bouton ne devrait pas être présent
    const toggleButton = screen.queryByText('Changer');
    expect(toggleButton).not.toBeInTheDocument();
  });
  
  it('should show toggle button when showToggle is true', () => {
    render(<OperationModeStatus showToggle={true} />);
    
    // Le bouton devrait être présent
    const toggleButton = screen.getByText('Changer');
    expect(toggleButton).toBeInTheDocument();
  });
  
  it('should call toggle function when toggle button is clicked', () => {
    render(<OperationModeStatus showToggle={true} />);
    
    // Cliquer sur le bouton
    const toggleButton = screen.getByText('Changer');
    fireEvent.click(toggleButton);
    
    // Vérifier que la fonction toggle a été appelée
    expect(toggleMock).toHaveBeenCalled();
    
    // Vérifier que toast.info a été appelé
    expect(toast.info).toHaveBeenCalledWith(
      'Mode démonstration activé',
      expect.objectContaining({
        description: 'Utilisation de données simulées'
      })
    );
  });
  
  it('should not display label when showLabel is false', () => {
    render(<OperationModeStatus showLabel={false} />);
    
    // Le texte ne devrait pas être présent
    const modeLabel = screen.queryByText('Mode réel');
    expect(modeLabel).not.toBeInTheDocument();
  });
  
  it('should apply custom className', () => {
    const { container } = render(<OperationModeStatus className="custom-class" />);
    
    // Vérifier que la classe est appliquée
    const element = container.firstChild;
    expect(element).toHaveClass('custom-class');
  });
  
  it('should adjust size based on size prop', () => {
    const { container } = render(<OperationModeStatus size="sm" />);
    
    // Les classes devraient refléter la taille sm
    const badgeElement = container.querySelector('[class*="px-1.5 py-0 text-xs"]');
    expect(badgeElement).toBeInTheDocument();
  });
});
