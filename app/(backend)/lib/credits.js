export const CREDIT_TRANSACTION_TYPES = {
  BOOKING_DEBIT: 'booking_debit',
  BOOKING_CREDIT: 'booking_credit',
  MANUAL_ADJUSTMENT: 'manual_adjustment'
};

export function createCreditTransaction({
  type,
  bookingID = null,
  serviceID = null,
  actorID = null,
  delta,
  balanceBefore,
  balanceAfter,
  title = '',
  note = ''
}) {
  return {
    type,
    bookingID,
    serviceID,
    actorID,
    delta,
    balanceBefore,
    balanceAfter,
    title,
    note,
    createdAt: new Date()
  };
}

export function applyCreditDelta(user, delta, transaction) {
  const balanceBefore = Number(user.credits || 0);
  const balanceAfter = balanceBefore + delta;

  if (balanceAfter < 0) {
    return {
      success: false,
      error: 'Insufficient credits',
      balanceBefore,
      balanceAfter
    };
  }

  user.credits = balanceAfter;
  user.creditTransactions = user.creditTransactions || [];
  if (transaction) {
    user.creditTransactions.unshift(transaction);
  }

  return {
    success: true,
    balanceBefore,
    balanceAfter
  };
}