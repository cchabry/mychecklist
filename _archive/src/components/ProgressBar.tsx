
import React from 'react';

interface ProgressBarProps {
  progress: number;
  total: number;
  score: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ progress, total, score }) => {
  const percentage = Math.round((progress / total) * 100);
  
  const getScoreColor = () => {
    if (score < 50) return 'text-tmw-coral';
    if (score < 80) return 'text-warning';
    return 'text-success';
  };
  
  return (
    <div className="bg-white rounded-xl p-5 mb-6 transition-all duration-300 hover:shadow-md shadow-sm border border-tmw-teal/20">
      <div className="flex justify-between items-center mb-2">
        <div>
          <h3 className="text-sm font-medium text-muted-foreground">Progression de l'audit</h3>
          <div className="text-2xl font-semibold text-tmw-darkgray">{progress} / {total} critères évalués</div>
        </div>
        
        <div className="text-right">
          <div className="text-sm font-medium text-muted-foreground">Score de conformité</div>
          <div className={`text-3xl font-bold ${getScoreColor()}`}>
            {progress === 0 ? '-' : `${score}%`}
          </div>
        </div>
      </div>
      
      <div className="h-2 w-full bg-tmw-gray rounded-full overflow-hidden">
        <div 
          className="h-full rounded-full transition-all duration-500 ease-apple"
          style={{ width: `${percentage}%`, 
                  backgroundColor: score < 50 ? '#E87A69' : 
                                    score < 80 ? 'hsl(var(--warning))' : 
                                    'hsl(var(--success))' }}
        ></div>
      </div>
      
      <div className="flex justify-between mt-1 text-xs text-muted-foreground">
        <span>0%</span>
        <span>50%</span>
        <span>100%</span>
      </div>
    </div>
  );
};

export default ProgressBar;
