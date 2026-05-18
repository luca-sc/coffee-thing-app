/**
 * orderService.js
 * ---------------------------------------------------------------------
 * LOGICA DE BUSINESS PRINCIPALA (Task 2 din cerinta - testare UNITARA).
 *
 * Functiile de aici sunt PURE: primesc date, returneaza un rezultat si
 * nu depind de baza de date sau de retea. Acest lucru le face usor de
 * testat unitar (corectitudinea algoritmului, cazuri limita, gestionare
 * erori) fara a porni serverul sau MySQL.
 *
 * Reguli de business implementate pentru o comanda la cafenea:
 *   - subtotal   = suma (cantitate * pret unitar) pe toate liniile
 *   - discount   = reducere in functie de valoarea comenzii (loyalty)
 *   - tax        = TVA aplicat dupa scaderea discountului
 *   - total      = subtotal - discount + tax
 * ---------------------------------------------------------------------
 */

// Cota de TVA aplicata (19% in Romania pentru servicii de alimentatie publica)
const TAX_RATE = 0.09;

// Praguri de reducere (loyalty): comenzi mari primesc discount procentual
const DISCOUNT_TIERS = [
  { threshold: 100, rate: 0.15 }, // peste 100 lei  -> 15% reducere
  { threshold: 50,  rate: 0.10 }, // peste 50 lei   -> 10% reducere
  { threshold: 25,  rate: 0.05 }, // peste 25 lei   ->  5% reducere
];

/**
 * Rotunjeste o valoare monetara la 2 zecimale.
 * Evita erorile de virgula mobila (ex: 0.1 + 0.2 !== 0.3).
 * @param {number} value
 * @returns {number}
 */
function roundMoney(value) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

/**
 * Valideaza o singura linie de comanda.
 * @param {{quantity:number, unitPrice:number}} item
 * @throws {Error} daca linia este invalida
 */
function validateItem(item) {
  if (!item || typeof item !== 'object') {
    throw new Error('Linia de comanda este invalida');
  }
  if (!Number.isInteger(item.quantity) || item.quantity <= 0) {
    throw new Error('Cantitatea trebuie sa fie un numar intreg pozitiv');
  }
  if (typeof item.unitPrice !== 'number' || item.unitPrice < 0 || Number.isNaN(item.unitPrice)) {
    throw new Error('Pretul unitar trebuie sa fie un numar pozitiv');
  }
}

/**
 * Calculeaza subtotalul unei comenzi (suma liniilor).
 * @param {Array<{quantity:number, unitPrice:number}>} items
 * @returns {number} subtotalul rotunjit la 2 zecimale
 * @throws {Error} daca lista de produse este invalida sau goala
 */
function calculateSubtotal(items) {
  if (!Array.isArray(items)) {
    throw new Error('Lista de produse trebuie sa fie un array');
  }
  if (items.length === 0) {
    throw new Error('Comanda trebuie sa contina cel putin un produs');
  }

  let subtotal = 0;
  for (const item of items) {
    validateItem(item);
    subtotal += item.quantity * item.unitPrice;
  }
  return roundMoney(subtotal);
}

/**
 * Determina rata de reducere (loyalty) in functie de subtotal.
 * @param {number} subtotal
 * @returns {number} rata de reducere (0, 0.05, 0.10 sau 0.15)
 */
function getDiscountRate(subtotal) {
  for (const tier of DISCOUNT_TIERS) {
    if (subtotal >= tier.threshold) {
      return tier.rate;
    }
  }
  return 0;
}

/**
 * Calculeaza valoarea reducerii pentru un subtotal dat.
 * @param {number} subtotal
 * @returns {number} valoarea reducerii rotunjita la 2 zecimale
 */
function calculateDiscount(subtotal) {
  if (typeof subtotal !== 'number' || subtotal < 0 || Number.isNaN(subtotal)) {
    throw new Error('Subtotalul trebuie sa fie un numar pozitiv');
  }
  return roundMoney(subtotal * getDiscountRate(subtotal));
}

/**
 * Calculeaza TVA-ul, aplicat DUPA scaderea reducerii.
 * @param {number} taxableAmount  suma impozabila (subtotal - discount)
 * @returns {number} valoarea TVA rotunjita la 2 zecimale
 */
function calculateTax(taxableAmount) {
  if (typeof taxableAmount !== 'number' || taxableAmount < 0 || Number.isNaN(taxableAmount)) {
    throw new Error('Suma impozabila trebuie sa fie un numar pozitiv');
  }
  return roundMoney(taxableAmount * TAX_RATE);
}

/**
 * Functia principala de business: calculeaza nota de plata completa
 * a unei comenzi pornind de la liniile ei.
 *
 * @param {Array<{quantity:number, unitPrice:number}>} items
 * @returns {{subtotal:number, discount:number, tax:number, total:number,
 *            discountRate:number}}
 * @throws {Error} daca datele de intrare sunt invalide
 *
 * @example
 *   calculateOrderTotal([{ quantity: 2, unitPrice: 4.5 }])
 *   // => { subtotal: 9, discount: 0, tax: 0.81, total: 9.81, discountRate: 0 }
 */
function calculateOrderTotal(items) {
  const subtotal = calculateSubtotal(items);
  const discount = calculateDiscount(subtotal);
  const taxableAmount = roundMoney(subtotal - discount);
  const tax = calculateTax(taxableAmount);
  const total = roundMoney(subtotal - discount + tax);

  return {
    subtotal,
    discount,
    tax,
    total,
    discountRate: getDiscountRate(subtotal),
  };
}

/**
 * Verifica daca o tranzitie de stare a comenzii este permisa.
 * Fluxul normal: pending -> preparing -> ready -> delivered -> paid.
 * @param {string} from  starea curenta
 * @param {string} to    starea dorita
 * @returns {boolean}
 */
function canTransitionStatus(from, to) {
  const allowed = {
    pending:   ['preparing', 'paid'],
    preparing: ['ready'],
    ready:     ['delivered'],
    delivered: ['paid'],
    paid:      [], // stare finala, nu se mai poate schimba
  };
  if (!Object.prototype.hasOwnProperty.call(allowed, from)) {
    return false;
  }
  return allowed[from].includes(to);
}

module.exports = {
  TAX_RATE,
  DISCOUNT_TIERS,
  roundMoney,
  validateItem,
  calculateSubtotal,
  getDiscountRate,
  calculateDiscount,
  calculateTax,
  calculateOrderTotal,
  canTransitionStatus,
};
