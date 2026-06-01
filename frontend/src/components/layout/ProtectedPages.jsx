import React from 'react'
import NavBar from './NavBar'
import FooterSection from '../FooterSection'

export const ProtectedPages = ({ children }) => {
  return (
    <div>
        <NavBar />
        {children}
        <FooterSection />
    </div>
  )
}