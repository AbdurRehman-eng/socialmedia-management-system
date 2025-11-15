import { useState, useEffect } from 'react'

export function useCoinBalance() {
  const [balance, setBalance] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchBalance() {
      try {
        const response = await fetch('/api/balance')
        if (!response.ok) {
          throw new Error('Failed to fetch balance')
        }
        const data = await response.json()
        setBalance(data.balance)
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
      const response = await fetch('/api/balance')
      if (!response.ok) {
        throw new Error('Failed to fetch balance')
      }
      const data = await response.json()
      setBalance(data.balance)
    } catch (error) {
      console.error('Error refreshing coin balance:', error)
    } finally {
      setLoading(false)
    }
  }

  return { balance: balance ?? 0, loading, refresh }
}

