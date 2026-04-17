export function formatINR(value: number) {
  const v = Number.isFinite(value) ? value : 0
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(v)
}

const USD_TO_INR = 83

export function usdToInr(usd: number) {
  const v = Number.isFinite(usd) ? usd : 0
  return v * USD_TO_INR
}

