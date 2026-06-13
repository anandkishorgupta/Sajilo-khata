// src/pages/PaymentVerifyPage.tsx
import { api } from '@/services/api-client'
import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'

export default function PaymentVerifyPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [status, setStatus] = useState<'loading' | 'success' | 'failed'>('loading')
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    const pidx = searchParams.get('pidx')
console.log("Received pidx:", pidx)
    // ✅ only check pidx — never trust frontend status param
    // always let backend verify via Khalti lookup API
    if (!pidx) {
      setErrorMsg('Missing payment ID.')
      setStatus('failed')
      return
    }

    api.post('/payments/verify', { pidx })
      .then(() => {
        setStatus('success')
        setTimeout(() => navigate('/login'), 2500)
      })
      .catch((err) => {
        const msg = err.response?.data?.message || 'Something went wrong.'
        setErrorMsg(msg)
        setStatus('failed')
      })
  }, [])

  if (status === 'loading') return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent" />
        <p className="text-muted-foreground">Verifying your payment...</p>
      </div>
    </div>
  )

  if (status === 'success') return (
    <div className="flex min-h-screen items-center justify-center text-center">
      <div>
        <div className="text-5xl mb-4">🎉</div>
        <h1 className="text-xl font-semibold">Payment successful!</h1>
        <p className="text-muted-foreground mt-2">Redirecting to your dashboard...</p>
      </div>
    </div>
  )

  return (
    <div className="flex min-h-screen items-center justify-center text-center">
      <div>
        <h1 className="text-xl font-semibold text-destructive">Payment failed</h1>
        <p className="text-muted-foreground mt-2">{errorMsg || 'Something went wrong.'}</p>
        <button
          onClick={() => navigate('/trial-expired')}
          className="mt-4 text-emerald-600 underline"
        >
          Go back
        </button>
      </div>
    </div>
  )
}