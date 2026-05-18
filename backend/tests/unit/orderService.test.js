/**
 * tests/unit/orderService.test.js
 * ---------------------------------------------------------------------
 * TESTE UNITARE pentru logica de business (Task 2 din cerinta).
 *
 * Conform tabelului: "Corectitudinea algoritmului, cazuri limita,
 * gestionare erori". Aceste teste NU folosesc baza de date sau reteaua,
 * doar functiile pure din orderService.js.
 * ---------------------------------------------------------------------
 */
const orderService = require('../../src/services/orderService');

describe('orderService - logica de business (teste unitare)', () => {

  // ============ corectitudinea algoritmului ============
  describe('calculateSubtotal - corectitudinea algoritmului', () => {
    test('calculeaza corect subtotalul pentru o singura linie', () => {
      const items = [{ quantity: 2, unitPrice: 4.5 }];
      expect(orderService.calculateSubtotal(items)).toBe(9.0);
    });

    test('calculeaza corect subtotalul pentru mai multe linii', () => {
      const items = [
        { quantity: 2, unitPrice: 4.5 },  // 9.00
        { quantity: 1, unitPrice: 3.0 },  // 3.00
        { quantity: 3, unitPrice: 2.5 },  // 7.50
      ];
      expect(orderService.calculateSubtotal(items)).toBe(19.5);
    });

    test('rotunjeste corect rezultatul la 2 zecimale', () => {
      const items = [{ quantity: 3, unitPrice: 3.33 }]; // 9.99
      expect(orderService.calculateSubtotal(items)).toBe(9.99);
    });
  });

  describe('getDiscountRate - praguri de reducere', () => {
    test('fara reducere sub pragul de 25', () => {
      expect(orderService.getDiscountRate(24.99)).toBe(0);
    });
    test('5% reducere la exact 25', () => {
      expect(orderService.getDiscountRate(25)).toBe(0.05);
    });
    test('10% reducere la exact 50', () => {
      expect(orderService.getDiscountRate(50)).toBe(0.10);
    });
    test('15% reducere peste 100', () => {
      expect(orderService.getDiscountRate(150)).toBe(0.15);
    });
  });

  describe('calculateOrderTotal - calculul complet al notei de plata', () => {
    test('comanda mica: subtotal, fara discount, cu TVA', () => {
      const result = orderService.calculateOrderTotal([
        { quantity: 2, unitPrice: 4.5 }, // subtotal 9.00
      ]);
      expect(result.subtotal).toBe(9.0);
      expect(result.discount).toBe(0);
      expect(result.tax).toBe(0.81);     // 9.00 * 0.09
      expect(result.total).toBe(9.81);   // 9.00 - 0 + 0.81
    });

    test('comanda cu reducere de 10% aplicata corect', () => {
      const result = orderService.calculateOrderTotal([
        { quantity: 10, unitPrice: 6.0 }, // subtotal 60.00
      ]);
      expect(result.subtotal).toBe(60.0);
      expect(result.discountRate).toBe(0.10);
      expect(result.discount).toBe(6.0);          // 60 * 0.10
      expect(result.tax).toBe(4.86);              // (60 - 6) * 0.09
      expect(result.total).toBe(58.86);           // 60 - 6 + 4.86
    });

    test('TVA-ul se aplica DUPA scaderea reducerii', () => {
      const result = orderService.calculateOrderTotal([
        { quantity: 20, unitPrice: 6.0 }, // subtotal 120 -> discount 15%
      ]);
      expect(result.discount).toBe(18.0);         // 120 * 0.15
      // TVA pe 102 (nu pe 120)
      expect(result.tax).toBe(9.18);              // 102 * 0.09
      expect(result.total).toBe(111.18);
    });
  });

  // ============ cazuri limita ============
  describe('cazuri limita', () => {
    test('pretul zero produce subtotal zero', () => {
      const result = orderService.calculateOrderTotal([
        { quantity: 5, unitPrice: 0 },
      ]);
      expect(result.subtotal).toBe(0);
      expect(result.total).toBe(0);
    });

    test('cantitate de 1 produs functioneaza corect', () => {
      expect(orderService.calculateSubtotal([{ quantity: 1, unitPrice: 2.5 }]))
        .toBe(2.5);
    });

    test('exact la pragul de discount (granita)', () => {
      // subtotal exact 25.00 trebuie sa primeasca 5% reducere
      const result = orderService.calculateOrderTotal([
        { quantity: 10, unitPrice: 2.5 },
      ]);
      expect(result.subtotal).toBe(25.0);
      expect(result.discount).toBe(1.25);
    });

    test('valori cu multe zecimale se rotunjesc corect', () => {
      expect(orderService.roundMoney(0.1 + 0.2)).toBe(0.3);
      expect(orderService.roundMoney(9.999)).toBe(10.0);
    });
  });

  // ============ gestionarea erorilor ============
  describe('gestionarea erorilor', () => {
    test('arunca eroare pentru lista goala de produse', () => {
      expect(() => orderService.calculateSubtotal([]))
        .toThrow('cel putin un produs');
    });

    test('arunca eroare daca items nu este un array', () => {
      expect(() => orderService.calculateSubtotal('nu e array'))
        .toThrow('array');
    });

    test('arunca eroare pentru cantitate negativa', () => {
      expect(() => orderService.calculateSubtotal([
        { quantity: -2, unitPrice: 4.5 },
      ])).toThrow('intreg pozitiv');
    });

    test('arunca eroare pentru cantitate zero', () => {
      expect(() => orderService.calculateSubtotal([
        { quantity: 0, unitPrice: 4.5 },
      ])).toThrow('intreg pozitiv');
    });

    test('arunca eroare pentru cantitate ne-intreaga', () => {
      expect(() => orderService.calculateSubtotal([
        { quantity: 1.5, unitPrice: 4.5 },
      ])).toThrow('intreg pozitiv');
    });

    test('arunca eroare pentru pret negativ', () => {
      expect(() => orderService.calculateSubtotal([
        { quantity: 2, unitPrice: -4.5 },
      ])).toThrow('numar pozitiv');
    });

    test('arunca eroare pentru pret care nu e numar', () => {
      expect(() => orderService.calculateSubtotal([
        { quantity: 2, unitPrice: 'gratis' },
      ])).toThrow('numar pozitiv');
    });
  });

  // ============ tranzitii de stare ============
  describe('canTransitionStatus - validarea fluxului comenzii', () => {
    test('permite tranzitia pending -> preparing', () => {
      expect(orderService.canTransitionStatus('pending', 'preparing')).toBe(true);
    });

    test('permite tranzitia preparing -> ready', () => {
      expect(orderService.canTransitionStatus('preparing', 'ready')).toBe(true);
    });

    test('NU permite saltul pending -> delivered', () => {
      expect(orderService.canTransitionStatus('pending', 'delivered')).toBe(false);
    });

    test('NU permite modificarea unei comenzi deja platite', () => {
      expect(orderService.canTransitionStatus('paid', 'pending')).toBe(false);
    });

    test('NU permite tranzitia dintr-o stare inexistenta', () => {
      expect(orderService.canTransitionStatus('inexistent', 'ready')).toBe(false);
    });
  });
});
