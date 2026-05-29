import React from 'react'
import logo from '../assets/logo.png'

export default function NavBar() {
  return (
    <header className="border-b bg-white">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <img src={logo} alt="GrowDigitally" className="h-8 w-auto" />
          <span className="font-semibold text-gray-800">GrowDigitally</span>
        </div>

        <nav className="hidden md:flex items-center space-x-6 text-gray-600">
          <div className="group relative">
            <button className="flex items-center gap-2 hover:text-gray-900">Features
              <svg className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z" clipRule="evenodd" />
              </svg>
            </button>
          </div>

          <div className="group relative">
            <button className="flex items-center gap-2 hover:text-gray-900">Use Cases
              <svg className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z" clipRule="evenodd" />
              </svg>
            </button>
          </div>

          <a className="hover:text-gray-900" href="#">Free Tools</a>
          <a className="hover:text-gray-900" href="#">Pricing</a>
          <a className="hover:text-gray-900" href="#">Articles</a>
        </nav>

        <div className="flex items-center space-x-3">
          <button className="rounded px-4 py-2 text-white" style={{ backgroundColor: '#5E2CED' }}>Try for Free</button>
        </div>
      </div>
    </header>
  )
}
