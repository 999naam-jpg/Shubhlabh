import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { auth } from '../firebase'
import { useToast } from '../context/ToastContext'
import styles from './Login.module.css'

const TABS = ['Google', 'Email']

export default function Login() {
  const { user, loginWithGoogle, loginWithEmail, registerWithEmail } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const [tab, setTab] = useState('Google')

  // Email state
  const [isRegister, setIsRegister] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => { if (user) navigate('/') }, [user])

  const clearError = () => setError('')

  // Google
  const handleGoogle = async () => {
    setError(''); setLoading(true)
    try {
      const cred = await loginWithGoogle()
      showToast(`Welcome, ${cred.user.displayName}! 🎉`)
    }
    catch { setError('Google sign-in failed. Try again.') }
    finally { setLoading(false) }
  }

  // Email
  const handleEmail = async e => {
    e.preventDefault(); setError(''); setLoading(true)
    try {
      const cred = isRegister
        ? await registerWithEmail(email, password)
        : await loginWithEmail(email, password)

      if (isRegister) {
        // Show verification message, don't navigate
        setError('')
        setLoading(false)
        setIsRegister(false)
        // Show success message
        alert(`✅ Account created! A verification email has been sent to ${email}. Please verify before signing in.`)
        return
      }

      // Check email verified for login
      if (!cred.user.emailVerified) {
        await auth.signOut()
        setError('Please verify your email before signing in. Check your inbox.')
        setLoading(false)
        return
      }

      const name = cred.user.displayName || email.split('@')[0]
      showToast(`Welcome back, ${name}! 👋`)
    } catch (err) {
      setError(friendlyError(err.code))
    } finally { setLoading(false) }
  }

  // Phone — verify OTP
  const handleVerifyOtp = async e => {
    e.preventDefault(); setError(''); setLoading(true)
    try { await verifyOtp(otp) }
    catch { setError('Invalid OTP. Please try again.') }
    finally { setLoading(false) }
  }

  return (
    <main className={styles.page}>
      <div className={styles.card}>
        <Link to="/" className={styles.brand}>🌸 Shubh Labh Event</Link>
        <h2>{tab === 'Email' && isRegister ? 'Create Account' : 'Welcome Back'}</h2>
        <p>Sign in to manage your rentals and orders</p>

        {/* Tabs */}
        <div className={styles.tabs}>
          {TABS.map(t => (
            <button
              key={t}
              className={`${styles.tab} ${tab === t ? styles.tabActive : ''}`}
              onClick={() => { setTab(t); clearError() }}
            >
              {t === 'Google' ? '🔵 Google' : '✉️ Email'}
            </button>
          ))}
        </div>

        {error && <div className={styles.error}>{error}
          {error.includes('verify') && (
            <button type="button" style={{ marginLeft: '0.5rem', background: 'none', border: 'none', color: '#0ea5e9', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600 }}
              onClick={async () => {
                try {
                  const { sendEmailVerification } = await import('firebase/auth')
                  const cred = await loginWithEmail(email, password)
                  await sendEmailVerification(cred.user)
                  await auth.signOut()
                  setError('Verification email resent! Check your inbox.')
                } catch {}
              }}>Resend email</button>
          )}
        </div>}

        {/* Google */}
        {tab === 'Google' && (
          <button className={styles.googleBtn} onClick={handleGoogle} disabled={loading}>
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="" width={18} />
            {loading ? 'Signing in...' : 'Continue with Google'}
          </button>
        )}

        {/* Email */}
        {tab === 'Email' && (
          <form onSubmit={handleEmail} className={styles.form}>
            <div className={styles.field}>
              <label>Email Address</label>
              <input type="email" required placeholder="you@email.com" value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            <div className={styles.field}>
              <label>Password</label>
              <input type="password" required placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} />
            </div>
            <button type="submit" className={styles.submitBtn} disabled={loading}>
              {loading ? 'Please wait...' : isRegister ? 'Create Account' : 'Sign In'}
            </button>
            <p className={styles.toggle}>
              {isRegister ? 'Already have an account?' : "Don't have an account?"}
              <button type="button" className={styles.toggleBtn} onClick={() => { setIsRegister(!isRegister); clearError() }}>
                {isRegister ? ' Sign In' : ' Register'}
              </button>
            </p>
          </form>
        )}

        <div id="recaptcha-container" />
      </div>
    </main>
  )
}

function friendlyError(code) {
  const map = {
    'auth/user-not-found': 'No account found with this email.',
    'auth/wrong-password': 'Incorrect password.',
    'auth/email-already-in-use': 'This email is already registered.',
    'auth/weak-password': 'Password must be at least 6 characters.',
    'auth/invalid-email': 'Please enter a valid email address.',
    'auth/too-many-requests': 'Too many attempts. Try again later.',
  }
  return map[code] || 'Something went wrong. Please try again.'
}
