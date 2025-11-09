import { useState, useEffect } from 'react'
import { getCoinBalance } from '@/lib/coins'

export function useCoinBalance() {
  const [balance, setBalance] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchBalance() {
      try {
        const coins = await getCoinBalance()
        setBalance(coins)
      } catch (error) {
        console.error('Error fetching coin balance:', error)
        setBalance(1000) // Fallback
      } finally {
        setLoading(false)
      }
    }

    fetchBalance()
  }, [])

  const refresh = async () => {
    setLoading(true)
    try {
      const coins = await getCoinBalance()
      setBalance(coins)
    } catch (error) {
      console.error('Error refreshing coin balance:', error)
    } finally {
      setLoading(false)
    }
  }

  return { balance: balance ?? 0, loading, refresh }
}

