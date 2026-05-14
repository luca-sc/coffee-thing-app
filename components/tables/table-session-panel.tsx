'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Users, Plus, Check, Coffee, ChevronDown, ChevronUp, 
  ShoppingBag, Trash2, ChefHat, Truck, CheckCircle2, 
  CreditCard, Banknote, Clock, DollarSign
} from 'lucide-react';
import { useTableStore } from '@/store/table-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { mockProducts, categoryLabels } from '@/data/mock-data';
import { Product, ProductCategory, Order } from '@/types';

const getStatusInfo = (status: Order['status']) => {
  switch (status) {
    case 'pending':
      return { label: 'In asteptare', icon: Clock, color: 'bg-yellow-500/20 text-yellow-600', spinning: false };
    case 'preparing':
      return { label: 'Se pregateste...', icon: ChefHat, color: 'bg-orange-500/20 text-orange-500', spinning: true };
    case 'ready':
      return { label: 'Vine la tine!', icon: Truck, color: 'bg-blue-500/20 text-blue-500', spinning: false };
    case 'delivered':
      return { label: 'A ajuns!', icon: CheckCircle2, color: 'bg-green-500/20 text-green-500', spinning: false };
    case 'paid':
      return { label: 'Platita', icon: DollarSign, color: 'bg-emerald-500/20 text-emerald-500', spinning: false };
    default:
      return { label: status, icon: Clock, color: 'bg-muted text-muted-foreground', spinning: false };
  }
};

export function TableSessionPanel() {
  const {
    selectedTable,
    selectTable,
    getTableCustomers,
    getCustomerOrders,
    addCustomerToTable,
    removeCustomerFromTable,
    setPaymentMethod,
    markOrderPaid,
    closeTableSession,
    createOrder,
    addItemToOrder,
    removeItemFromOrder,
    updateOrderStatus,
  } = useTableStore();

  const [customerNames, setCustomerNames] = useState<string[]>(['']);
  const [showAddCustomers, setShowAddCustomers] = useState(false);
  const [expandedCustomers, setExpandedCustomers] = useState<Record<string, boolean>>({});
  const [customerMenuOpen, setCustomerMenuOpen] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory>('coffee');

  if (!selectedTable) {
    return (
      <div className="bg-card rounded-xl border border-border p-8 text-center">
        <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h3 className="font-serif text-xl font-semibold text-foreground mb-2">
          Selecteaza o Masa
        </h3>
        <p className="text-muted-foreground">
          Apasa pe orice masa pentru a vedea detaliile si a gestiona clientii
        </p>
      </div>
    );
  }

  const customers = getTableCustomers(selectedTable.id);
  const isTableFree = selectedTable.status === 'free' || customers.length === 0;

  const handleAddCustomerField = () => {
    if (customerNames.length < selectedTable.capacity) {
      setCustomerNames([...customerNames, '']);
    }
  };

  const handleRemoveCustomerField = (index: number) => {
    if (customerNames.length > 1) {
      setCustomerNames(customerNames.filter((_, i) => i !== index));
    }
  };

  const handleCustomerNameChange = (index: number, value: string) => {
    const updated = [...customerNames];
    updated[index] = value;
    setCustomerNames(updated);
  };

  const handleAddAllCustomers = () => {
    const validNames = customerNames.filter(name => name.trim());
    if (validNames.length === 0) {
      toast.error('Introdu cel putin un nume de client');
      return;
    }
    if (customers.length + validNames.length > selectedTable.capacity) {
      toast.error('Depaseste capacitatea mesei');
      return;
    }

    validNames.forEach(name => {
      addCustomerToTable(selectedTable.id, name.trim());
    });

    setCustomerNames(['']);
    setShowAddCustomers(false);
    toast.success(`${validNames.length} clienti adaugati la Masa #${selectedTable.number}`);
  };

  const handleRemoveCustomer = (customerId: string, customerName: string) => {
    removeCustomerFromTable(customerId);
    toast.success(`${customerName} a fost eliminat de la masa`);
  };

  const handleCloseSession = () => {
    closeTableSession(selectedTable.id);
    toast.success(`Sesiunea Mesei #${selectedTable.number} a fost inchisa`);
  };

  const toggleCustomerExpanded = (customerId: string) => {
    setExpandedCustomers(prev => ({
      ...prev,
      [customerId]: !prev[customerId],
    }));
  };

  const toggleCustomerMenu = (customerId: string) => {
    setCustomerMenuOpen(prev => prev === customerId ? null : customerId);
  };

  const handleAddProductToCustomer = (customerId: string, product: Product) => {
    const customerOrders = getCustomerOrders(customerId);
    let activeOrder = customerOrders.find(o => o.paymentStatus !== 'paid');

    if (!activeOrder) {
      activeOrder = createOrder(customerId, selectedTable.id);
    }

    addItemToOrder(activeOrder.id, product, 1);
    toast.success(`${product.name} adaugat pentru client`);
  };

  const handleRemoveItemFromOrder = (orderId: string, itemId: string) => {
    removeItemFromOrder(orderId, itemId);
    toast.success('Produs eliminat din comanda');
  };

  const handlePayOrder = (orderId: string, method: 'cash' | 'card') => {
    setPaymentMethod(orderId, method);
    markOrderPaid(orderId);
    toast.success(`Comanda platita cu ${method === 'card' ? 'card' : 'cash'}`);
  };

  // Simulate order progression for demo
  const handleSimulateOrderProgress = (orderId: string, currentStatus: Order['status']) => {
    if (currentStatus === 'pending' || currentStatus === 'preparing') {
      updateOrderStatus(orderId, 'ready');
      toast.success('Comanda e pe drum!');
    } else if (currentStatus === 'ready') {
      updateOrderStatus(orderId, 'delivered');
      toast.success('Comanda a ajuns!');
    }
  };

  const categories = Object.keys(categoryLabels) as ProductCategory[];
  const filteredProducts = mockProducts.filter(p => p.category === selectedCategory && p.available);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-xl border border-border overflow-hidden"
    >
      {/* Header */}
      <div className="p-4 border-b border-border flex items-center justify-between">
        <div>
          <h3 className="font-serif text-xl font-semibold text-foreground">
            Masa #{selectedTable.number}
          </h3>
          <p className="text-sm text-muted-foreground">
            {customers.length} / {selectedTable.capacity} locuri
          </p>
        </div>
        <div className="flex items-center gap-2">
          {selectedTable.status === 'occupied' && customers.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleCloseSession}
              className="text-destructive hover:bg-destructive/10"
            >
              Inchide Sesiunea
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => selectTable(null)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <ScrollArea className="h-[600px]">
        <div className="p-4 space-y-4">
          {/* Add Customers Form - shown when table is free */}
          {isTableFree && !showAddCustomers && (
            <Button
              variant="default"
              className="w-full bg-primary hover:bg-primary/90"
              onClick={() => setShowAddCustomers(true)}
            >
              <Users className="h-4 w-4 mr-2" />
              Adauga Clienti la Masa
            </Button>
          )}

          <AnimatePresence>
            {showAddCustomers && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-3 p-4 bg-secondary/30 rounded-lg border border-border"
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-foreground">Adauga Clienti</h4>
                  <span className="text-xs text-muted-foreground">
                    Max {selectedTable.capacity - customers.length} clienti
                  </span>
                </div>

                {customerNames.map((name, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      placeholder={`Nume Client ${index + 1}`}
                      value={name}
                      onChange={(e) => handleCustomerNameChange(index, e.target.value)}
                      className="flex-1"
                    />
                    {customerNames.length > 1 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveCustomerField(index)}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}

                {customerNames.length < selectedTable.capacity - customers.length && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleAddCustomerField}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Adauga alt client
                  </Button>
                )}

                <div className="flex gap-2 pt-2">
                  <Button
                    variant="default"
                    className="flex-1"
                    onClick={handleAddAllCustomers}
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Confirma ({customerNames.filter(n => n.trim()).length} clienti)
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setShowAddCustomers(false);
                      setCustomerNames(['']);
                    }}
                  >
                    Anuleaza
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Add more customers button when table is occupied */}
          {!isTableFree && customers.length < selectedTable.capacity && !showAddCustomers && (
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setShowAddCustomers(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Adauga alt client ({selectedTable.capacity - customers.length} locuri libere)
            </Button>
          )}

          {/* Customers List */}
          {customers.length === 0 && !showAddCustomers ? (
            <div className="text-center py-8 text-muted-foreground">
              Niciun client la aceasta masa.
            </div>
          ) : (
            <div className="space-y-4">
              {customers.map((customer) => {
                const orders = getCustomerOrders(customer.id);
                const totalSpent = orders.reduce((sum, o) => sum + o.total, 0);
                const hasUnpaidOrders = orders.some(o => o.paymentStatus !== 'paid');
                const isExpanded = expandedCustomers[customer.id] ?? true; // Default expanded
                const isMenuOpen = customerMenuOpen === customer.id;

                return (
                  <motion.div
                    key={customer.id}
                    layout
                    className="rounded-lg border border-border overflow-hidden bg-card"
                  >
                    {/* Customer Header */}
                    <div 
                      className="p-4 cursor-pointer hover:bg-secondary/30 transition-colors"
                      onClick={() => toggleCustomerExpanded(customer.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="font-semibold text-primary">
                              {customer.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <h4 className="font-semibold text-foreground">{customer.name}</h4>
                            <p className="text-xs text-muted-foreground">
                              {orders.length} comanda{orders.length !== 1 ? 'zi' : ''} - Total: ${totalSpent.toFixed(2)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {hasUnpaidOrders && (
                            <Badge variant="destructive" className="text-xs">
                              Neplatit
                            </Badge>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveCustomer(customer.id, customer.name);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                          {isExpanded ? (
                            <ChevronUp className="h-5 w-5 text-muted-foreground" />
                          ) : (
                            <ChevronDown className="h-5 w-5 text-muted-foreground" />
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Expanded Content */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="border-t border-border"
                        >
                          <div className="p-4 space-y-3">
                            {/* Open Menu Button */}
                            <Button
                              variant={isMenuOpen ? "default" : "outline"}
                              className="w-full"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleCustomerMenu(customer.id);
                              }}
                            >
                              <Coffee className="h-4 w-4 mr-2" />
                              {isMenuOpen ? 'Inchide Meniul' : 'Deschide Meniul pentru a Comanda'}
                            </Button>

                            {/* Menu Panel */}
                            <AnimatePresence>
                              {isMenuOpen && (
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: 'auto' }}
                                  exit={{ opacity: 0, height: 0 }}
                                  className="space-y-3 p-3 bg-secondary/30 rounded-lg"
                                >
                                  {/* Category Tabs */}
                                  <div className="flex flex-wrap gap-1">
                                    {categories.map((cat) => (
                                      <Button
                                        key={cat}
                                        variant={selectedCategory === cat ? "default" : "ghost"}
                                        size="sm"
                                        onClick={() => setSelectedCategory(cat)}
                                        className="text-xs"
                                      >
                                        {categoryLabels[cat]}
                                      </Button>
                                    ))}
                                  </div>

                                  {/* Products Grid */}
                                  <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                                    {filteredProducts.map((product) => (
                                      <button
                                        key={product.id}
                                        onClick={() => handleAddProductToCustomer(customer.id, product)}
                                        className="p-2 bg-card rounded-lg border border-border hover:border-primary hover:bg-primary/5 transition-all text-left"
                                      >
                                        <p className="font-medium text-sm text-foreground truncate">
                                          {product.name}
                                        </p>
                                        <p className="text-xs text-primary font-semibold">
                                          ${product.price.toFixed(2)}
                                        </p>
                                      </button>
                                    ))}
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>

                            {/* Customer Orders with Status */}
                            {orders.length > 0 && (
                              <div className="space-y-3">
                                <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                                  <ShoppingBag className="h-4 w-4" />
                                  Comenzile lui {customer.name}:
                                </div>
                                
                                {orders.map((order) => {
                                  const statusInfo = getStatusInfo(order.status);
                                  const StatusIcon = statusInfo.icon;
                                  const canProgress = order.status === 'preparing' || order.status === 'ready';
                                  const needsPayment = order.status === 'delivered' && order.paymentStatus !== 'paid';

                                  return (
                                    <motion.div
                                      key={order.id}
                                      layout
                                      className="bg-secondary/20 rounded-lg border border-border overflow-hidden"
                                    >
                                      {/* Order Status Header */}
                                      <div className={`px-3 py-2 flex items-center justify-between ${statusInfo.color}`}>
                                        <div className="flex items-center gap-2">
                                          <motion.div
                                            animate={statusInfo.spinning ? { rotate: 360 } : {}}
                                            transition={statusInfo.spinning ? { duration: 2, repeat: Infinity, ease: 'linear' } : {}}
                                          >
                                            <StatusIcon className="h-4 w-4" />
                                          </motion.div>
                                          <span className="font-medium text-sm">{statusInfo.label}</span>
                                        </div>
                                        <span className="font-bold">${order.total.toFixed(2)}</span>
                                      </div>

                                      {/* Order Items */}
                                      <div className="p-3 space-y-1">
                                        {order.items.map((item) => (
                                          <div 
                                            key={item.id} 
                                            className="flex items-center justify-between text-sm"
                                          >
                                            <div className="flex items-center gap-2">
                                              <span className="text-primary font-medium">
                                                {item.quantity}x
                                              </span>
                                              <span className="text-foreground">
                                                {item.product.name}
                                              </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                              <span className="text-muted-foreground">
                                                ${item.price.toFixed(2)}
                                              </span>
                                              {order.paymentStatus !== 'paid' && (
                                                <button
                                                  onClick={() => handleRemoveItemFromOrder(order.id, item.id)}
                                                  className="text-muted-foreground hover:text-destructive transition-colors"
                                                >
                                                  <X className="h-3 w-3" />
                                                </button>
                                              )}
                                            </div>
                                          </div>
                                        ))}
                                      </div>

                                      {/* Action Buttons */}
                                      {canProgress && (
                                        <div className="px-3 pb-3">
                                          <Button
                                            size="sm"
                                            variant="outline"
                                            className="w-full text-xs"
                                            onClick={() => handleSimulateOrderProgress(order.id, order.status)}
                                          >
                                            {order.status === 'preparing' ? 'Marcheaza ca pe drum' : 'Marcheaza ca livrata'}
                                          </Button>
                                        </div>
                                      )}

                                      {/* Payment Section */}
                                      {needsPayment && (
                                        <div className="p-3 border-t border-border bg-green-500/5">
                                          <p className="text-xs text-muted-foreground mb-2 text-center">
                                            Alege metoda de plata:
                                          </p>
                                          <div className="flex gap-2">
                                            <Button
                                              size="sm"
                                              variant="outline"
                                              className="flex-1"
                                              onClick={() => handlePayOrder(order.id, 'card')}
                                            >
                                              <CreditCard className="h-4 w-4 mr-1" />
                                              Card
                                            </Button>
                                            <Button
                                              size="sm"
                                              variant="outline"
                                              className="flex-1"
                                              onClick={() => handlePayOrder(order.id, 'cash')}
                                            >
                                              <Banknote className="h-4 w-4 mr-1" />
                                              Cash
                                            </Button>
                                          </div>
                                        </div>
                                      )}

                                      {/* Paid Status */}
                                      {order.paymentStatus === 'paid' && (
                                        <div className="px-3 pb-3 flex items-center justify-center gap-2 text-green-500">
                                          <CheckCircle2 className="h-4 w-4" />
                                          <span className="text-sm font-medium">
                                            Platit cu {order.paymentMethod === 'card' ? 'card' : 'cash'}
                                          </span>
                                        </div>
                                      )}
                                    </motion.div>
                                  );
                                })}
                              </div>
                            )}

                            {orders.length === 0 && (
                              <p className="text-sm text-muted-foreground text-center py-2 bg-secondary/20 rounded-lg">
                                Nicio comanda inca. Clientul poate comanda din meniu.
                              </p>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </ScrollArea>
    </motion.div>
  );
}
