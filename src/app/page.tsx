import Link from 'next/link'

export default function Home() {
  return (
    <main style={{
      background: '#080f0a',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'monospace',
      color: '#f0fdf4',
      textAlign: 'center',
      padding: '40px'
    }}>

      <div style={{
        background: '#22c55e',
        borderRadius: '12px',
        width: '60px',
        height: '60px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '28px',
        fontWeight: '900',
        color: 'white',
        marginBottom: '24px',
        boxShadow: '0 0 30px rgba(34,197,94,0.4)'
      }}>K</div>

      <h1 style={{
        fontSize: '64px',
        fontWeight: '800',
        letterSpacing: '-2px',
        marginBottom: '16px',
        color: 'white',
        fontFamily: 'sans-serif',
        lineHeight: '1'
      }}>
        Kata<span style={{ color: '#22c55e' }}>Deals</span>
      </h1>

      <p style={{
        color: '#4d7a57',
        fontSize: '18px',
        marginBottom: '16px',
        maxWidth: '500px',
        lineHeight: '1.7'
      }}>
        The AI powered real estate decision engine.
      </p>

      <p style={{
        color: '#4d7a57',
        fontSize: '15px',
        marginBottom: '48px',
        maxWidth: '500px',
        lineHeight: '1.7'
      }}>
        Underwrite any deal in under 60 seconds.
        Input an address and get instant analysis —
        rehab costs, ARV, financing scenarios,
        and exit strategies.
      </p>

      <div style={{
        display: 'flex',
        gap: '16px',
        flexWrap: 'wrap',
        justifyContent: 'center',
        marginBottom: '64px'
      }}>
        <Link href="/analyze" style={{
          background: '#22c55e',
          color: 'white',
          padding: '16px 32px',
          borderRadius: '8px',
          textDecoration: 'none',
          fontWeight: '700',
          fontSize: '16px',
          fontFamily: 'sans-serif',
          boxShadow: '0 0 24px rgba(34,197,94,0.3)'
        }}>
          Analyze a Deal
        </Link>

        <Link href="/pricing" style={{
          background: 'transparent',
          color: 'white',
          padding: '16px 32px',
          borderRadius: '8px',
          textDecoration: 'none',
          fontWeight: '700',
          fontSize: '16px',
          fontFamily: 'sans-serif',
          border: '1px solid #1a2e1e'
        }}>
          View Pricing
        </Link>
      </div>

      <div style={{
        display: 'flex',
        gap: '48px',
        flexWrap: 'wrap',
        justifyContent: 'center',
        marginBottom: '64px'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '30px', fontWeight: '800', color: '#22c55e', fontFamily: 'sans-serif' }}>$2.4B+</div>
          <div style={{ fontSize: '11px', color: '#4d7a57', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Deals Analyzed</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '30px', fontWeight: '800', color: '#22c55e', fontFamily: 'sans-serif' }}>18K+</div>
          <div style={{ fontSize: '11px', color: '#4d7a57', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Active Investors</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '30px', fontWeight: '800', color: '#22c55e', fontFamily: 'sans-serif' }}>94%</div>
          <div style={{ fontSize: '11px', color: '#4d7a57', letterSpacing: '0.1em', textTransform: 'uppercase' }}>ARV Accuracy</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '30px', fontWeight: '800', color: '#22c55e', fontFamily: 'sans-serif' }}>47s</div>
          <div style={{ fontSize: '11px', color: '#4d7a57', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Avg Analysis Time</div>
        </div>
      </div>

      <div style={{
        background: '#0c1510',
        border: '1px solid #1a2e1e',
        borderRadius: '14px',
        padding: '32px',
        maxWidth: '600px',
        width: '100%'
      }}>
        <div style={{ fontSize: '10px', color: '#22c55e', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '16px' }}>
          How It Works
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', textAlign: 'left' }}>
            <div style={{ background: '#22c55e', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '700', fontSize: '14px', flexShrink: 0 }}>1</div>
            <div>
              <div style={{ color: 'white', fontWeight: '600', fontFamily: 'sans-serif', marginBottom: '4px' }}>Enter any property address</div>
              <div style={{ color: '#4d7a57', fontSize: '12px' }}>Type an address or describe the property</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', textAlign: 'left' }}>
            <div style={{ background: '#22c55e', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '700', fontSize: '14px', flexShrink: 0 }}>2</div>
            <div>
              <div style={{ color: 'white', fontWeight: '600', fontFamily: 'sans-serif', marginBottom: '4px' }}>Select your rehab level</div>
              <div style={{ color: '#4d7a57', fontSize: '12px' }}>Cosmetic, Moderate, or Full Gut</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', textAlign: 'left' }}>
            <div style={{ background: '#22c55e', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '700', fontSize: '14px', flexShrink: 0 }}>3</div>
            <div>
              <div style={{ color: 'white', fontWeight: '600', fontFamily: 'sans-serif', marginBottom: '4px' }}>Get your full AI analysis</div>
              <div style={{ color: '#4d7a57', fontSize: '12px' }}>ARV, rehab costs, financing, exit strategies and more</div>
            </div>
          </div>
        </div>
      </div>

    </main>
  )
}
