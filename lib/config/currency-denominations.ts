// Configuración de denominaciones por moneda
export const CURRENCY_DENOMINATIONS: Record<string, { bills: string[]; coins: string[] }> = {
  // Peso Chileno
  CLP: {
    bills: ["20000", "10000", "5000", "2000", "1000"],
    coins: ["500", "100", "50", "10", "5", "1"],
  },
  // Dólar Estadounidense
  USD: {
    bills: ["100", "50", "20", "10", "5", "2", "1"],
    coins: ["0.5", "0.25", "0.1", "0.05", "0.01"],
  },
  // Euro
  EUR: {
    bills: ["500", "200", "100", "50", "20", "10", "5"],
    coins: ["2", "1", "0.5", "0.2", "0.1", "0.05", "0.02", "0.01"],
  },
  // Peso Argentino
  ARS: {
    bills: ["1000", "500", "200", "100", "50", "20", "10"],
    coins: ["5", "2", "1", "0.5", "0.25", "0.10"],
  },
  // Peso Mexicano
  MXN: {
    bills: ["1000", "500", "200", "100", "50", "20"],
    coins: ["10", "5", "2", "1", "0.5", "0.2", "0.1"],
  },
  // Peso Colombiano
  COP: {
    bills: ["100000", "50000", "20000", "10000", "5000", "2000", "1000"],
    coins: ["500", "200", "100", "50"],
  },
  // Sol Peruano
  PEN: {
    bills: ["200", "100", "50", "20", "10"],
    coins: ["5", "2", "1", "0.5", "0.2", "0.1", "0.05", "0.01"],
  },
}

// Función para obtener las denominaciones según la moneda
export function getDenominationsForCurrency(currencyCode: string) {
  return CURRENCY_DENOMINATIONS[currencyCode] || CURRENCY_DENOMINATIONS["USD"]
}
