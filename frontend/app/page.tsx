'use client'

import Link from 'next/link'
import { 
  ShieldCheckIcon, 
  DocumentTextIcon, 
  UserGroupIcon, 
  ChartBarIcon,
  UserIcon,
  ClipboardDocumentCheckIcon,
  MagnifyingGlassIcon,
  CheckCircleIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline'

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-md shadow-lg border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <ShieldCheckIcon className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-2xl font-bold gradient-text">AutoClaims</h1>
            </div>
            <div className="flex space-x-3">
              <Link href="/login" className="btn-secondary">
                Login
              </Link>
              <Link href="/register" className="btn-primary">
                Register
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-purple-600/10 to-indigo-600/10"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <h2 className="text-6xl font-bold text-gray-900 mb-4 leading-tight">
            Streamline Your <span className="gradient-text">Auto Insurance</span> Claims
          </h2>
          <p className="text-2xl font-medium text-blue-600 mb-6">Claims Made Simple</p>
          <p className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed">
            Professional claims processing system with role-based workflows, document management, 
            and real-time collaboration for insurance companies and customers.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register" className="btn-primary text-lg px-10 py-4">
              Start Processing Claims
            </Link>
            <Link href="/login" className="btn-secondary text-lg px-10 py-4">
              Login to Dashboard
            </Link>
          </div>
        </div>
      </section>

      {/* Workflow Section */}
      <section className="py-16 bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="text-4xl font-bold text-gray-900 mb-4">How Claims Processing Works</h3>
            <p className="text-xl text-gray-600">Simple 5-step workflow from submission to settlement</p>
          </div>
          
          <div className="flex flex-col lg:flex-row items-center justify-between space-y-8 lg:space-y-0 lg:space-x-4">
            {/* Step 1 - Customer */}
            <div className="flex flex-col items-center text-center">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                <UserIcon className="h-8 w-8 text-white" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Customer</h4>
              <p className="text-sm text-gray-600 mb-2">Submit Claim</p>
              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">SUBMITTED</span>
            </div>
            
            <div className="hidden lg:block text-gray-400">
              <ChevronRightIcon className="h-6 w-6" />
            </div>
            
            {/* Step 2 - Agent */}
            <div className="flex flex-col items-center text-center">
              <div className="bg-gradient-to-br from-green-500 to-green-600 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                <ClipboardDocumentCheckIcon className="h-8 w-8 text-white" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Agent</h4>
              <p className="text-sm text-gray-600 mb-2">Review & Validate</p>
              <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">UNDER REVIEW</span>
            </div>
            
            <div className="hidden lg:block text-gray-400">
              <ChevronRightIcon className="h-6 w-6" />
            </div>
            
            {/* Step 3 - Manager */}
            <div className="flex flex-col items-center text-center">
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                <UserGroupIcon className="h-8 w-8 text-white" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Manager</h4>
              <p className="text-sm text-gray-600 mb-2">Assign Adjuster</p>
              <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">ASSIGNED</span>
            </div>
            
            <div className="hidden lg:block text-gray-400">
              <ChevronRightIcon className="h-6 w-6" />
            </div>
            
            {/* Step 4 - Adjuster */}
            <div className="flex flex-col items-center text-center">
              <div className="bg-gradient-to-br from-orange-500 to-orange-600 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                <MagnifyingGlassIcon className="h-8 w-8 text-white" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Adjuster</h4>
              <p className="text-sm text-gray-600 mb-2">Investigate & Approve</p>
              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">APPROVED</span>
            </div>
            
            <div className="hidden lg:block text-gray-400">
              <ChevronRightIcon className="h-6 w-6" />
            </div>
            
            {/* Step 5 - Admin */}
            <div className="flex flex-col items-center text-center">
              <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                <CheckCircleIcon className="h-8 w-8 text-white" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Admin</h4>
              <p className="text-sm text-gray-600 mb-2">Process Settlement</p>
              <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">SETTLED</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-4xl font-bold text-center text-gray-900 mb-16">
            Powerful Features for Every Role
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="card text-center hover:scale-105 transition-transform duration-200">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <DocumentTextIcon className="h-8 w-8 text-white" />
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-3">Smart Claims Processing</h4>
              <p className="text-gray-600">Automated workflows with status tracking and notifications</p>
            </div>
            <div className="card text-center hover:scale-105 transition-transform duration-200">
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <UserGroupIcon className="h-8 w-8 text-white" />
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-3">Role-Based Access</h4>
              <p className="text-gray-600">Secure access control for customers, agents, adjusters, managers, and admins</p>
            </div>
            <div className="card text-center hover:scale-105 transition-transform duration-200">
              <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <ShieldCheckIcon className="h-8 w-8 text-white" />
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-3">Document Management</h4>
              <p className="text-gray-600">Secure upload and management of claim documents</p>
            </div>
            <div className="card text-center hover:scale-105 transition-transform duration-200">
              <div className="bg-gradient-to-br from-blue-600 to-purple-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <ChartBarIcon className="h-8 w-8 text-white" />
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-3">Analytics Dashboard</h4>
              <p className="text-gray-600">Real-time insights and reporting capabilities</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-gray-900 to-gray-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center mb-4">
            <ShieldCheckIcon className="h-6 w-6 text-blue-400 mr-2" />
            <span className="text-lg font-semibold">AutoClaims</span>
          </div>
          <p className="text-gray-400">
            Professional auto insurance claims processing system
          </p>
        </div>
      </footer>
    </div>
  )
}