const { createClient } = require('@supabase/supabase-js')
const { Resend } = require('resend')

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

const resend = new Resend(process.env.RESEND_API_KEY)

async function logAttempt(code, success, reason, clientName = 'Unknown', device = 'unknown') {
  await supabase.from('logs').insert({ code, success, reason, client_name: clientName, device })
}

function generateCode() {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { email, code, fingerprintId } = req.body || {}
  if (!email || !code) return res.status(400).json({ error: 'Missing fields.' })

  const fp = fingerprintId || 'unknown'

  // Find client by email + code
  const { data: client, error } = await supabase
    .from('clients')
    .select('*')
    .eq('code', code.trim())
    .eq('email', email.trim().toLowerCase())
    .single()

  if (error || !client) {
    await logAttempt(code, false, 'Invalid credentials', 'Unknown', fp)
    return res.status(401).json({ error: 'Invalid email or code.' })
  }

  // Check expiry
  if (client.expiry_time && new Date() > new Date(client.expiry_time)) {
    await logAttempt(code, false, 'Code expired', client.name, fp)
    return res.status(401).json({ error: 'Access has expired.' })
  }

  // Check one-time use
  if (client.expiry_setting === 'once' && client.once_used) {
    await logAttempt(code, false, 'One-time code already used', client.name, fp)
    return res.status(401).json({ error: 'Access has expired. (One-time code used)' })
  }

  // Fingerprint binding — bind on first login, block on mismatch
  if (!client.fingerprint_id) {
    const updates = { fingerprint_id: fp }
    if (client.expiry_setting === 'once') updates.once_used = true
    await supabase.from('clients').update(updates).eq('id', client.id)
  } else if (client.fingerprint_id !== fp) {
    await logAttempt(code, false, 'Device mismatch', client.name, fp)
    return res.status(401).json({ error: 'Security protocol triggered: Device mismatch.' })
  }

  // Generate 6-digit verification code (valid 10 minutes)
  const verificationCode = generateCode()
  const expiry = new Date(Date.now() + 10 * 60 * 1000).toISOString()

  await supabase
    .from('clients')
    .update({ verification_code: verificationCode, verification_expiry: expiry })
    .eq('id', client.id)

  // Send email via Resend
  try {
    await resend.emails.send({
      from: `Private Collection <noreply@${process.env.DOMEIN}>`,
      to: client.email,
      subject: 'Your access code — Private Collection',
      html: `
        <div style="font-family: 'Inter', sans-serif; max-width: 480px; margin: 0 auto; background: #f5f3ef; padding: 48px 40px; color: #091813;">
          <p style="font-size: 10px; letter-spacing: 0.2em; text-transform: uppercase; color: #6b7a74; margin: 0 0 32px;">Private Collection</p>
          <h1 style="font-size: 24px; font-weight: 600; margin: 0 0 8px; letter-spacing: -0.5px;">Welcome, ${client.name}</h1>
          <p style="font-size: 14px; color: #6b7a74; margin: 0 0 40px; line-height: 1.6;">Your verification code to access the private collection:</p>
          <div style="background: #091813; color: #f5f3ef; text-align: center; padding: 28px; letter-spacing: 0.4em; font-size: 28px; font-weight: 600; margin: 0 0 32px;">${verificationCode}</div>
          <p style="font-size: 12px; color: #a8a49e; margin: 0; line-height: 1.6;">This code expires in 10 minutes. Do not share this code with anyone.</p>
          <div style="border-top: 1px solid #ddd9d2; margin-top: 40px; padding-top: 24px;">
            <p style="font-size: 10px; letter-spacing: 0.15em; text-transform: uppercase; color: #c8c4bc; margin: 0;">By invitation only</p>
          </div>
        </div>
      `
    })
  } catch (emailErr) {
    console.error('Email send failed:', emailErr)
    return res.status(500).json({ error: 'Failed to send verification email. Please try again.' })
  }

  await logAttempt(code, true, 'Verification code sent', client.name, fp)

  return res.status(200).json({ success: true, message: 'Verification code sent to your email.' })
}
