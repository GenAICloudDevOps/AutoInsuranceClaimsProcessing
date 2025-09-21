'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { auth, claims } from '../../lib/auth'

export default function NewClaimPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [policies, setPolicies] = useState<any[]>([])
  const [formData, setFormData] = useState({
    policy_id: '',
    incident_date: '',
    incident_description: '',
    incident_location: ''
  })
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      if (!auth.isAuthenticated()) {
        router.push('/login')
        return
      }
      try {
        const userData = await auth.getCurrentUser()
        setUser(userData)
        
        // Fetch user policies
        const userPolicies = await auth.api.get('/policies')
        if (userPolicies.data.length === 0) {
          // Create default policy if none exists
          await auth.api.post('/policies')
          const newPolicies = await auth.api.get('/policies')
          setPolicies(newPolicies.data)
          setFormData(prev => ({ ...prev, policy_id: newPolicies.data[0]?.id || '' }))
        } else {
          setPolicies(userPolicies.data)
          setFormData(prev => ({ ...prev, policy_id: userPolicies.data[0]?.id || '' }))
        }
      } catch (error) {
        router.push('/login')
      }
    }
    checkAuth()
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await claims.create({
        ...formData,
        incident_date: new Date(formData.incident_date).toISOString()
      })
      alert('Claim submitted successfully!')
      router.push('/claims')
    } catch (error) {
      console.error('Failed to create claim:', error)
      alert('Failed to create claim. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">File New Claim</h1>
              <div className="flex items-center space-x-2 mt-1">
                <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                  {user?.role?.toUpperCase()}
                </span>
                <span className="text-gray-500">•</span>
                <span className="text-gray-600">{user?.first_name} {user?.last_name}</span>
              </div>
            </div>
            <button
              onClick={() => router.push('/dashboard')}
              className="btn-secondary"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <form onSubmit={handleSubmit} className="card space-y-6">
          <div>
            <label htmlFor="policy_id" className="block text-sm font-medium text-gray-700">
              Select Policy
            </label>
            <select
              id="policy_id"
              name="policy_id"
              required
              value={formData.policy_id}
              onChange={handleChange}
              className="mt-1 input-field"
            >
              <option value="">Select a policy</option>
              {policies.map(policy => (
                <option key={policy.id} value={policy.id}>
                  {policy.policy_number} - {policy.vehicle_make} {policy.vehicle_model}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="incident_date" className="block text-sm font-medium text-gray-700">
              Incident Date
            </label>
            <input
              type="datetime-local"
              id="incident_date"
              name="incident_date"
              required
              value={formData.incident_date}
              onChange={handleChange}
              className="mt-1 input-field"
            />
          </div>

          <div>
            <label htmlFor="incident_location" className="block text-sm font-medium text-gray-700">
              Incident Location
            </label>
            <input
              type="text"
              id="incident_location"
              name="incident_location"
              required
              value={formData.incident_location}
              onChange={handleChange}
              placeholder="Enter the location where the incident occurred"
              className="mt-1 input-field"
            />
          </div>

          <div>
            <label htmlFor="incident_description" className="block text-sm font-medium text-gray-700">
              Incident Description
            </label>
            <textarea
              id="incident_description"
              name="incident_description"
              required
              rows={4}
              value={formData.incident_description}
              onChange={handleChange}
              placeholder="Describe what happened in detail..."
              className="mt-1 input-field resize-none"
            />
          </div>

          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => router.push('/dashboard')}
              className="flex-1 btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 btn-primary disabled:opacity-50"
            >
              {loading ? 'Submitting...' : 'Submit Claim'}
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}