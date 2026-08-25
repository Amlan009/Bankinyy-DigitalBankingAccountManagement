export function isCredit(tx) {
  if (!tx) return false
  const type = String(tx.type || '').toUpperCase()
  if (type === 'DEPOSIT' || type === 'CREDIT') return true
  if (type === 'PAYMENT' || type === 'WITHDRAWAL' || type === 'DEBIT') return false
  return Number(tx.amount) > 0
}

export function transactionClass(tx) {
  return isCredit(tx) ? 'credit' : 'debit'
}

export function formatSignedAmount(tx, formatCurrency) {
  const amount = Math.abs(Number(tx?.amount || 0))
  return `${isCredit(tx) ? '+' : '-'}${formatCurrency(amount)}`
}

export function accountLabel(account) {
  if (!account) return 'Account'
  return account.accountNickname || account.nickname || account.bankName || account.bank?.name || 'Account'
}
