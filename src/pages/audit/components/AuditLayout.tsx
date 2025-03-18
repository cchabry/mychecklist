import React from 'react';
import Header from '@/components/Header';
import { NotionConfig } from '@/components/notion';

interface AuditLayoutProps {
  children: React.ReactNode;
  notionConfigOpen: boolean;
  onNotionConfigClose: () => void;
  onNotionConfigSuccess: () => void;
}

const AuditLayout: React.FC<AuditLayoutProps> = ({
  children,
  notionConfigOpen,
  onNotionConfigClose,
  onNotionConfigSuccess
}) => {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-background to-tmw-teal/5">
      <Header />
      
      <main className="flex-1 container px-4 py-8 mx-auto">
        {children}
      </main>
      
      <footer className="py-6 border-t border-tmw-teal/10 bg-background">
        <div className="container px-4 mx-auto text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} myChecklist - Audits Qualité Web
          <div className="mt-2 text-xs text-muted-foreground/70">by ThinkMyWeb</div>
        </div>
      </footer>
      
      <NotionConfig 
        isOpen={notionConfigOpen} 
        onClose={onNotionConfigClose}
        onSuccess={onNotionConfigSuccess}
      />
    </div>
  );
};

export default AuditLayout;
