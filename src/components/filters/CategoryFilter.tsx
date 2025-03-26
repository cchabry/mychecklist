
import React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export type Category = {
  id: string;
  name: string;
  count?: number;
  color?: string;
};

export type CategoryFilterProps = {
  categories: Category[];
  selectedCategories: string[];
  onChange: (categories: string[]) => void;
  className?: string;
  title?: string;
};

/**
 * Filtre par catégories avec sélection multiple
 */
export const CategoryFilter = ({
  categories,
  selectedCategories,
  onChange,
  className,
  title = "Catégories"
}: CategoryFilterProps) => {
  
  const toggleCategory = (categoryId: string) => {
    const isSelected = selectedCategories.includes(categoryId);
    let newSelectedCategories: string[];
    
    if (isSelected) {
      newSelectedCategories = selectedCategories.filter(id => id !== categoryId);
    } else {
      newSelectedCategories = [...selectedCategories, categoryId];
    }
    
    onChange(newSelectedCategories);
  };
  
  const selectAll = () => {
    if (selectedCategories.length === categories.length) {
      onChange([]);
    } else {
      onChange(categories.map(category => category.id));
    }
  };

  const allSelected = selectedCategories.length === categories.length;

  return (
    <div className={cn("w-full", className)}>
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-medium text-sm">{title}</h3>
        <button 
          onClick={selectAll}
          className="text-xs text-primary hover:underline"
        >
          {allSelected ? 'Désélectionner tout' : 'Tout sélectionner'}
        </button>
      </div>
      
      <div className="space-y-1">
        {categories.map(category => {
          const isSelected = selectedCategories.includes(category.id);
          return (
            <button
              key={category.id}
              className={cn(
                "w-full flex items-center justify-between px-3 py-2 rounded-md text-sm",
                isSelected ? "bg-primary/10 text-primary" : "hover:bg-muted"
              )}
              onClick={() => toggleCategory(category.id)}
            >
              <div className="flex items-center gap-2">
                {category.color && (
                  <span 
                    className="block w-3 h-3 rounded-full" 
                    style={{ backgroundColor: category.color }}
                  />
                )}
                <span>{category.name}</span>
              </div>
              
              <div className="flex items-center gap-2">
                {category.count !== undefined && (
                  <span className="text-xs text-muted-foreground">{category.count}</span>
                )}
                
                {isSelected && <Check className="w-4 h-4 text-primary" />}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default CategoryFilter;
