import { createContext, useContext, useEffect, useState } from 'react'
import { onAuthStateChanged, signInWithPopup, signInWithRedirect, getRedirectResult, signOut, updateProfile } from 'firebase/auth'
import {
  auth, googleProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from '../firebase'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Handle redirect result on page load
    getRedirectResult(auth).then(result => {
      if (result?.user) setUser(result.user)
    }).catch(() => {})

    const unsub = onAuthStateChanged(auth, u => {
      setUser(u)
      setLoading(false)
    })
    return unsub
  }, [])

  const loginWithGoogle = () => signInWithRedirect(auth, googleProvider)

  const registerWithEmail = async (email, password) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password)
    // Set default name from email + default avatar
    const defaultName = email.split('@')[0]
    const defaultPhoto = `https://ui-avatars.com/api/?name=${encodeURIComponent(defaultName)}&background=7c3aed&color=fff&rounded=true`
    await updateProfile(cred.user, { displayName: defaultName, photoURL: defaultPhoto })
    return cred
  }

  const loginWithEmail = async (email, password) => {
    const cred = await signInWithEmailAndPassword(auth, email, password)
    // If somehow no photo, set default
    if (!cred.user.photoURL) {
      const defaultName = cred.user.displayName || email.split('@')[0]
      const defaultPhoto = `https://ui-avatars.com/api/?name=${encodeURIComponent(defaultName)}&background=7c3aed&color=fff&rounded=true`
      await updateProfile(cred.user, { displayName: defaultName, photoURL: defaultPhoto })
    }
    return cred
  }

  const logout = () => signOut(auth)

  return (
    <AuthContext.Provider value={{
      user, loading,
      loginWithGoogle,
      loginWithEmail,
      registerWithEmail,
      logout,
    }}>
      {!loading && children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
