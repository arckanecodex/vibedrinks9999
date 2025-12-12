import { ShoppingCart, Trash2, Plus, Minus, ArrowRight, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useCart } from '@/lib/cart';
import { useAuth } from '@/lib/auth';
import { useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';

interface CartSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CartSheet({ open, onOpenChange }: CartSheetProps) {
  const { items, subtotal, updateQuantity, removeItem, clearCart, itemCount } = useCart();
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };


  const handleCheckout = () => {
    onOpenChange(false);
    if (isAuthenticated) {
      setLocation('/checkout');
    } else {
      setLocation('/login?redirect=/checkout');
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="bg-black/95 backdrop-blur-xl border-l border-primary/20 flex flex-col w-full sm:max-w-md p-0" data-testid="sheet-cart">
        <SheetHeader className="px-6 py-5 border-b border-primary/10 bg-gradient-to-r from-primary/5 to-transparent">
          <SheetTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-yellow-500 flex items-center justify-center">
                <ShoppingCart className="h-5 w-5 text-black" />
              </div>
              <div>
                <span className="font-serif text-xl text-primary">Carrinho</span>
                {itemCount > 0 && (
                  <p className="text-sm text-muted-foreground font-normal">
                    {itemCount} {itemCount === 1 ? 'item' : 'itens'}
                  </p>
                )}
              </div>
            </div>
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-24 h-24 rounded-full bg-secondary/50 flex items-center justify-center mb-6"
            >
              <ShoppingBag className="h-12 w-12 text-muted-foreground" />
            </motion.div>
            <h3 className="text-lg font-semibold text-white mb-2">Seu carrinho esta vazio</h3>
            <p className="text-muted-foreground mb-6 text-sm">
              Adicione produtos deliciosos para comecar
            </p>
            <Button 
              variant="outline" 
              className="border-primary/30 text-primary hover:bg-primary/10"
              onClick={() => onOpenChange(false)}
            >
              Ver produtos
            </Button>
          </div>
        ) : (
          <>
            <ScrollArea className="flex-1">
              <div className="p-4 space-y-3">
                <AnimatePresence>
                  {items.map((item) => (
                    <motion.div
                      key={item.productId}
                      layout
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="flex gap-4 p-4 bg-card/50 rounded-xl border border-primary/10 hover:border-primary/20 transition-colors"
                      data-testid={`cart-item-${item.productId}`}
                    >
                      <div className="w-20 h-20 rounded-lg overflow-hidden bg-secondary/50 flex-shrink-0">
                        {item.product.imageUrl ? (
                          <img
                            src={item.product.imageUrl}
                            alt={item.product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-primary text-2xl font-serif">
                            {item.product.name.charAt(0)}
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-medium text-white text-sm line-clamp-2 flex-1">
                            {item.product.name}
                          </h4>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-destructive flex-shrink-0"
                            onClick={() => removeItem(item.productId)}
                            data-testid={`button-cart-remove-${item.productId}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>

                        <p className="text-primary font-semibold mt-1">
                          {formatPrice(Number(item.product.salePrice))}
                        </p>

                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center gap-1 bg-secondary/50 rounded-lg p-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-primary hover:bg-primary/20"
                              onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                              data-testid={`button-cart-decrease-${item.productId}`}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-8 text-center text-white font-medium text-sm">
                              {item.quantity}
                            </span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-primary hover:bg-primary/20"
                              onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                              data-testid={`button-cart-increase-${item.productId}`}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                          <span className="text-white font-bold">
                            {formatPrice(Number(item.product.salePrice) * item.quantity)}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </ScrollArea>

            <div className="border-t border-primary/10 bg-gradient-to-t from-black to-transparent p-6 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-bold text-2xl bg-gradient-to-r from-amber-400 to-yellow-500 bg-clip-text text-transparent">
                  {formatPrice(subtotal)}
                </span>
              </div>
              
              <p className="text-xs text-muted-foreground">
                Frete calculado na finalizacao
              </p>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="border-muted-foreground/30 text-muted-foreground hover:bg-secondary/50 hover:text-white"
                  onClick={clearCart}
                  data-testid="button-clear-cart"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
                <Button
                  className="flex-1 h-12 bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-bold text-base"
                  onClick={handleCheckout}
                  data-testid="button-checkout"
                >
                  Finalizar Pedido
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
