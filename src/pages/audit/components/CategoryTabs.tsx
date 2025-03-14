
import React from 'react';
import { TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CATEGORIES } from '@/lib/mockData';

interface CategoryTabsProps {
  selectedCategory: string;
}

const CategoryTabs: React.FC<CategoryTabsProps> = ({ selectedCategory }) => {
  return (
    <TabsList className="bg-tmw-gray rounded-lg p-1 border border-tmw-blue/10">
      <TabsTrigger 
        value="all"
        className="data-[state=active]:bg-white data-[state=active]:text-tmw-blue data-[state=active]:shadow-sm"
      >
        Tous
      </TabsTrigger>
      {CATEGORIES.map(category => (
        <TabsTrigger 
          key={category} 
          value={category}
          className="data-[state=active]:bg-white data-[state=active]:text-tmw-blue data-[state=active]:shadow-sm"
        >
          {category}
        </TabsTrigger>
      ))}
    </TabsList>
  );
};

export default CategoryTabs;
