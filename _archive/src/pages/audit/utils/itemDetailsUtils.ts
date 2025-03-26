
import { AuditItem } from '@/lib/types';

export const enrichItemWithDetails = (item: AuditItem): AuditItem => {
  if (item.details) return item; // Already has details
  
  const detailsMap: Record<string, string> = {
    "item-1": "Vérifiez que toutes les images ont des attributs 'alt' descriptifs qui expliquent le contenu de l'image pour les utilisateurs de lecteurs d'écran.",
    "item-2": "Les pages doivent être accessibles à tous les utilisateurs, incluant ceux qui utilisent des technologies d'assistance. Assurez-vous que tous les éléments interactifs sont accessibles au clavier et portent des étiquettes descriptives.",
    "item-3": "Les liens doivent avoir un contraste suffisant et être facilement identifiables. Ils devraient se distinguer du texte normal par le style, la couleur ou le soulignement.",
    "item-4": "Assurez-vous que les pages se chargent rapidement. Optimisez les ressources, réduisez le nombre de requêtes HTTP et utilisez la mise en cache appropriée pour améliorer les performances.",
    "item-5": "Réduisez la taille des images sans compromettre la qualité visuelle. Utilisez le format d'image approprié (WebP, JPEG, PNG) selon le cas d'utilisation et appliquez une compression adéquate.",
    "item-6": "Structurez le contenu avec des balises de titre appropriées. Utilisez h1 pour le titre principal de la page, puis h2, h3, etc. pour les sous-sections, en respectant la hiérarchie.",
    "item-7": "Chaque page doit avoir une meta description unique, concise (120-158 caractères) et pertinente qui résume le contenu de la page pour les moteurs de recherche.",
    "item-8": "Le site doit s'adapter à différentes tailles d'écran sans perte de fonctionnalité. Testez sur différents appareils et assurez-vous que les éléments interactifs fonctionnent correctement sur mobile.",
    "item-9": "Assurez-vous que toutes les pages utilisent HTTPS. Vérifiez que le certificat SSL est valide, correctement configuré et n'expire pas prochainement.",
    "item-10": "La navigation du site doit être cohérente et intuitive. Les utilisateurs doivent pouvoir facilement comprendre où ils se trouvent et comment naviguer vers d'autres sections.",
    "item-11": "Les formulaires doivent indiquer clairement quels champs sont obligatoires et fournir des messages d'erreur spécifiques et utiles. Validez les entrées côté client et côté serveur.",
    "item-12": "Configurez des en-têtes CSP appropriés pour protéger contre les attaques XSS. Définissez des politiques strictes qui n'autorisent que les ressources nécessaires de sources fiables.",
    "item-13": "Utilisez des balises HTML5 sémantiques comme <header>, <nav>, <main>, <section>, <article> et <footer> pour structurer le contenu de manière logique et accessible.",
    "item-14": "Vérifiez régulièrement tous les liens internes et externes pour vous assurer qu'ils mènent à des pages actives. Mettez en place une stratégie pour gérer les liens rompus.",
    "item-15": "Testez le site sur les principaux navigateurs (Chrome, Firefox, Safari, Edge) et leurs versions récentes. Assurez-vous que l'apparence et les fonctionnalités sont cohérentes."
  };
  
  return {
    ...item,
    details: detailsMap[item.id] || ""
  };
};

export const enrichItemsWithDetails = (items: AuditItem[]): AuditItem[] => {
  return items.map(enrichItemWithDetails);
};
