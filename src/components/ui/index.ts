
/**
 * Export des composants UI réutilisables
 */

// Importer ces composants depuis le répertoire approprié
// Pour simplifier, nous utiliserons des composants fictifs pour le moment
export const Button = ({ children, ...props }: any) => <button {...props}>{children}</button>;
export const Input = ({ ...props }: any) => <input {...props} />;
export const Progress = ({ value = 0, ...props }: any) => (
  <div {...props}>
    <div style={{ width: `${value}%` }}></div>
  </div>
);
export const Badge = ({ children, variant, ...props }: any) => <span {...props}>{children}</span>;
export const Card = ({ children, ...props }: any) => <div {...props}>{children}</div>;
export const CardContent = ({ children, ...props }: any) => <div {...props}>{children}</div>;
export const CardFooter = ({ children, ...props }: any) => <div {...props}>{children}</div>;
export const CardHeader = ({ children, ...props }: any) => <div {...props}>{children}</div>;
