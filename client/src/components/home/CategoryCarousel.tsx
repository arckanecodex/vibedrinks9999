import { useRef } from 'react';
import { ChevronLeft, ChevronRight, Flame } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Category } from '@shared/schema';
import { TRENDING_CATEGORY_ID } from '@/pages/Home';
import { getCategoryIcon } from '@/lib/category-icons';

interface CategoryCarouselProps {
  categories: Category[];
  selectedCategory: string | null;
  onSelectCategory: (categoryId: string | null) => void;
  showTrending?: boolean;
}

export function CategoryCarousel({ categories, selectedCategory, onSelectCategory, showTrending = false }: CategoryCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const activeCategories = categories.filter(c => c.isActive).sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const scrollAmount = 200;
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth'
    });
  };

  if (activeCategories.length === 0) return null;

  const CategoryButton = ({ 
    isSelected, 
    onClick, 
    icon: Icon, 
    label, 
    variant = 'default',
    testId
  }: { 
    isSelected: boolean; 
    onClick: () => void; 
    icon: any; 
    label: string;
    variant?: 'default' | 'trending';
    testId: string;
  }) => {
    const baseColors = variant === 'trending' 
      ? {
          selected: 'from-orange-500/30 to-red-500/20 border-orange-500',
          unselected: 'from-secondary/60 to-secondary/40 border-orange-500/30 hover:border-orange-500/60',
          iconBg: isSelected ? 'bg-gradient-to-br from-orange-500 to-red-500' : 'bg-secondary/80 border border-orange-500/30',
          iconColor: isSelected ? 'text-white' : 'text-orange-500',
          textColor: isSelected ? 'text-orange-400' : 'text-white/80',
          glow: '0 0 20px rgba(249, 115, 22, 0.4)'
        }
      : {
          selected: 'from-primary/30 to-amber-500/20 border-primary',
          unselected: 'from-secondary/60 to-secondary/40 border-primary/20 hover:border-primary/50',
          iconBg: isSelected ? 'bg-gradient-to-br from-amber-400 to-yellow-500' : 'bg-secondary/80 border border-primary/30',
          iconColor: isSelected ? 'text-black' : 'text-primary/80',
          textColor: isSelected ? 'text-primary' : 'text-white/80',
          glow: '0 0 20px rgba(255, 215, 0, 0.3)'
        };

    return (
      <button
        onClick={onClick}
        className={`flex flex-col items-center gap-3 min-w-[110px] p-4 rounded-2xl transition-all duration-300 bg-gradient-to-b border-2 backdrop-blur-sm hover-elevate active-elevate-2 ${
          isSelected ? baseColors.selected : baseColors.unselected
        }`}
        style={isSelected ? { boxShadow: baseColors.glow } : {}}
        data-testid={testId}
      >
        <div className={`w-14 h-14 rounded-xl flex items-center justify-center transition-all duration-300 ${baseColors.iconBg}`}>
          <Icon className={`h-6 w-6 ${baseColors.iconColor}`} />
        </div>
        <span className={`text-sm font-medium text-center transition-colors duration-300 ${baseColors.textColor}`}>
          {label}
        </span>
      </button>
    );
  };

  return (
    <section className="py-8 px-4" data-testid="section-categories">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-serif text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary via-amber-400 to-primary bg-clip-text text-transparent">
            Categorias
          </h2>
          
          <div className="hidden md:flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9 rounded-full border-primary/30 text-primary hover:bg-primary/10"
              onClick={() => scroll('left')}
              data-testid="button-category-prev"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9 rounded-full border-primary/30 text-primary hover:bg-primary/10"
              onClick={() => scroll('right')}
              data-testid="button-category-next"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="relative">
          <div
            ref={scrollRef}
            className="flex gap-3 overflow-x-auto scrollbar-hide py-2 px-1 -mx-1"
            data-testid="carousel-categories"
          >
            <CategoryButton
              isSelected={selectedCategory === null}
              onClick={() => onSelectCategory(null)}
              icon={() => <span className="text-xl font-bold">A</span>}
              label="Todos"
              testId="button-category-all"
            />

            {showTrending && (
              <CategoryButton
                isSelected={selectedCategory === TRENDING_CATEGORY_ID}
                onClick={() => onSelectCategory(TRENDING_CATEGORY_ID)}
                icon={Flame}
                label="Em Alta"
                variant="trending"
                testId="button-category-trending"
              />
            )}

            {activeCategories.map((category) => {
              const IconComponent = getCategoryIcon(category.iconUrl);
              return (
                <CategoryButton
                  key={category.id}
                  isSelected={selectedCategory === category.id}
                  onClick={() => onSelectCategory(category.id)}
                  icon={IconComponent}
                  label={category.name}
                  testId={`button-category-${category.id}`}
                />
              );
            })}
          </div>

          <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-background to-transparent pointer-events-none md:hidden" />
        </div>
      </div>
    </section>
  );
}
