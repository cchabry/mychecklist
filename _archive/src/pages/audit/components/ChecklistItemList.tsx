
import React from 'react';
import { motion } from 'framer-motion';
import ChecklistItem from '@/components/ChecklistItem';
import { AuditItem, ComplianceStatus } from '@/lib/types';

interface ChecklistItemListProps {
  items: AuditItem[];
  onItemChange: (itemId: string, status: ComplianceStatus, comment?: string) => void;
}

const ChecklistItemList: React.FC<ChecklistItemListProps> = ({ items, onItemChange }) => {
  return (
    <div className="space-y-4">
      {items.map((item, index) => (
        <motion.div
          key={item.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.05 }}
        >
          <ChecklistItem 
            item={item} 
            onChange={onItemChange} 
          />
        </motion.div>
      ))}
    </div>
  );
};

export default ChecklistItemList;
