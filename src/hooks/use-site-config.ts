
import { create } from 'zustand';

interface SiteConfig {
  name: string;
  description: string;
  mainNav: Array<{ title: string; href: string }>;
  links: {
    github: string;
    documentation: string;
  };
}

interface SiteConfigStore {
  config: SiteConfig;
  updateConfig: (config: Partial<SiteConfig>) => void;
}

export const useSiteConfigStore = create<SiteConfigStore>((set) => ({
  config: {
    name: "Audit Web",
    description: "Application d'audit d'accessibilité pour sites web",
    mainNav: [
      {
        title: "Accueil",
        href: "/",
      },
      {
        title: "Projets",
        href: "/projects",
      },
      {
        title: "Diagnostics",
        href: "/diagnostics",
      },
    ],
    links: {
      github: "https://github.com/example/audit-web",
      documentation: "/documentation",
    },
  },
  updateConfig: (newConfig) =>
    set((state) => ({
      config: { ...state.config, ...newConfig },
    })),
}));

export const useSiteConfig = () => useSiteConfigStore((state) => state.config);
export const useUpdateSiteConfig = () => useSiteConfigStore((state) => state.updateConfig);
