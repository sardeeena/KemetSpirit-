import React from 'react';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbsProps {
  items: Array<{ label: string; href?: string; onClick?: () => void }>;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items }) => {
  return (
    <nav className="flex items-center gap-1.5 text-xs text-[#5C6F84] dark:text-slate-400 py-3" aria-label="Breadcrumbs">
      <button
        type="button"
        onClick={items[0]?.onClick}
        className="hover:text-[#0F4C81] dark:hover:text-sky-400 flex items-center transition-colors cursor-pointer whitespace-nowrap"
      >
        <Home className="w-3.5 h-3.5 mr-1 text-[#5C6F84] dark:text-slate-400" />
        <span>Home</span>
      </button>

      {items.slice(1).map((item, index) => {
        const isLast = index === items.length - 2;
        return (
          <React.Fragment key={index}>
            <ChevronRight className="w-3 h-3 text-[#DCE2EA] dark:text-slate-600 shrink-0" />
            {isLast ? (
              <span className="font-semibold text-[#0A192F] dark:text-white truncate max-w-[200px] sm:max-w-md">
                {item.label}
              </span>
            ) : (
              <button
                type="button"
                onClick={item.onClick}
                className="hover:text-[#0F4C81] dark:hover:text-sky-400 transition-colors whitespace-nowrap cursor-pointer"
              >
                {item.label}
              </button>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};
