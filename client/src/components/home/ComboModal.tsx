import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useQuery } from '@tanstack/react-query';
import { useCart } from '@/lib/cart';
import { useToast } from '@/hooks/use-toast';
import { Package, Zap, Snowflake, Percent, ShoppingCart, Loader2 } from 'lucide-react';
import type { Product } from '@shared/schema';

interface ComboModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type EnergeticoOption = '2L' | '5cans';

export function ComboModal({ open, onOpenChange }: ComboModalProps) {
  const { addCombo } = useCart();
  const { toast } = useToast();
  
  const [selectedDestilado, setSelectedDestilado] = useState<Product | null>(null);
  const [selectedEnergetico, setSelectedEnergetico] = useState<Product | null>(null);
  const [energeticoOption, setEnergeticoOption] = useState<EnergeticoOption>('2L');
  const [selectedGelo, setSelectedGelo] = useState<Product | null>(null);

  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ['/api/products'],
  });

  const destilados = products.filter(p => p.productType === 'destilado' && p.isActive && p.stock > 0);
  const energeticos2L = products.filter(p => p.productType === 'energetico' && p.isActive && p.stock > 0 && p.name.toLowerCase().includes('2l'));
  const energeticosCans = products.filter(p => p.productType === 'energetico' && p.isActive && p.stock >= 5 && !p.name.toLowerCase().includes('2l'));
  const gelos = products.filter(p => p.productType === 'gelo' && p.isActive && p.stock >= 5);

  const energeticoQuantity = energeticoOption === '2L' ? 1 : 5;
  const geloQuantity = 5;

  const calculateTotal = () => {
    if (!selectedDestilado || !selectedEnergetico || !selectedGelo) return { original: 0, discounted: 0 };
    
    const destiladoPrice = Number(selectedDestilado.salePrice);
    const energeticoPrice = Number(selectedEnergetico.salePrice) * energeticoQuantity;
    const geloPrice = Number(selectedGelo.salePrice) * geloQuantity;
    
    const original = destiladoPrice + energeticoPrice + geloPrice;
    const discounted = original * 0.85;
    
    return { original, discounted };
  };

  const totals = calculateTotal();

  const handleAddCombo = () => {
    if (!selectedDestilado || !selectedEnergetico || !selectedGelo) {
      toast({
        title: 'Selecione todos os itens',
        description: 'Escolha um destilado, um energetico e o gelo para montar seu combo.',
        variant: 'destructive',
      });
      return;
    }

    const comboId = `combo-${Date.now()}`;
    
    addCombo({
      id: comboId,
      destilado: selectedDestilado,
      energetico: selectedEnergetico,
      energeticoQuantity,
      gelo: selectedGelo,
      geloQuantity,
      discountPercent: 15,
      originalTotal: totals.original,
      discountedTotal: totals.discounted,
    });

    toast({
      title: 'Combo adicionado!',
      description: `Combo com 15% de desconto foi adicionado ao carrinho.`,
    });

    setSelectedDestilado(null);
    setSelectedEnergetico(null);
    setSelectedGelo(null);
    onOpenChange(false);
  };

  const resetSelections = () => {
    setSelectedDestilado(null);
    setSelectedEnergetico(null);
    setSelectedGelo(null);
    setEnergeticoOption('2L');
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen) resetSelections();
      onOpenChange(isOpen);
    }}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Percent className="h-6 w-6 text-primary" />
            Monte Seu Combo - 15% OFF
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">1. Escolha seu Destilado</h3>
              </div>
              <RadioGroup
                value={selectedDestilado?.id || ''}
                onValueChange={(value) => setSelectedDestilado(destilados.find(p => p.id === value) || null)}
                className="grid grid-cols-1 sm:grid-cols-2 gap-2"
              >
                {destilados.map((product) => (
                  <div key={product.id} className="flex items-center space-x-2">
                    <RadioGroupItem value={product.id} id={`destilado-${product.id}`} />
                    <Label 
                      htmlFor={`destilado-${product.id}`} 
                      className="flex-1 cursor-pointer text-sm"
                      data-testid={`radio-destilado-${product.id}`}
                    >
                      {product.name} - R$ {Number(product.salePrice).toFixed(2)}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
              {destilados.length === 0 && (
                <p className="text-sm text-muted-foreground">Nenhum destilado disponivel no momento.</p>
              )}
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">2. Escolha seu Energetico</h3>
              </div>
              
              <div className="flex gap-4 mb-3">
                <Button
                  variant={energeticoOption === '2L' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    setEnergeticoOption('2L');
                    setSelectedEnergetico(null);
                  }}
                  data-testid="button-energetico-2l"
                >
                  1 Garrafa 2L
                </Button>
                <Button
                  variant={energeticoOption === '5cans' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    setEnergeticoOption('5cans');
                    setSelectedEnergetico(null);
                  }}
                  data-testid="button-energetico-5cans"
                >
                  5 Latas
                </Button>
              </div>

              <RadioGroup
                value={selectedEnergetico?.id || ''}
                onValueChange={(value) => {
                  const list = energeticoOption === '2L' ? energeticos2L : energeticosCans;
                  setSelectedEnergetico(list.find(p => p.id === value) || null);
                }}
                className="grid grid-cols-1 sm:grid-cols-2 gap-2"
              >
                {(energeticoOption === '2L' ? energeticos2L : energeticosCans).map((product) => (
                  <div key={product.id} className="flex items-center space-x-2">
                    <RadioGroupItem value={product.id} id={`energetico-${product.id}`} />
                    <Label 
                      htmlFor={`energetico-${product.id}`} 
                      className="flex-1 cursor-pointer text-sm"
                      data-testid={`radio-energetico-${product.id}`}
                    >
                      {product.name} - R$ {Number(product.salePrice).toFixed(2)} {energeticoOption === '5cans' && 'x5'}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
              {((energeticoOption === '2L' && energeticos2L.length === 0) || (energeticoOption === '5cans' && energeticosCans.length === 0)) && (
                <p className="text-sm text-muted-foreground">Nenhum energetico disponivel para esta opcao.</p>
              )}
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Snowflake className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">3. Escolha seu Gelo (5 unidades)</h3>
              </div>
              <RadioGroup
                value={selectedGelo?.id || ''}
                onValueChange={(value) => setSelectedGelo(gelos.find(p => p.id === value) || null)}
                className="grid grid-cols-1 sm:grid-cols-2 gap-2"
              >
                {gelos.map((product) => (
                  <div key={product.id} className="flex items-center space-x-2">
                    <RadioGroupItem value={product.id} id={`gelo-${product.id}`} />
                    <Label 
                      htmlFor={`gelo-${product.id}`} 
                      className="flex-1 cursor-pointer text-sm"
                      data-testid={`radio-gelo-${product.id}`}
                    >
                      {product.name} - R$ {Number(product.salePrice).toFixed(2)} x5
                    </Label>
                  </div>
                ))}
              </RadioGroup>
              {gelos.length === 0 && (
                <p className="text-sm text-muted-foreground">Nenhum gelo disponivel no momento.</p>
              )}
            </div>

            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Subtotal:</span>
                <span className="line-through">R$ {totals.original.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-green-600 dark:text-green-400">
                <span>Desconto (15%):</span>
                <span>- R$ {(totals.original - totals.discounted).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold">
                <span>Total do Combo:</span>
                <span className="text-primary">R$ {totals.discounted.toFixed(2)}</span>
              </div>
            </div>

            <Button 
              className="w-full" 
              size="lg"
              onClick={handleAddCombo}
              disabled={!selectedDestilado || !selectedEnergetico || !selectedGelo}
              data-testid="button-add-combo"
            >
              <ShoppingCart className="h-5 w-5 mr-2" />
              Adicionar Combo ao Carrinho
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
