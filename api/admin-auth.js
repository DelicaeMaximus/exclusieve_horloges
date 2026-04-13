module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { email, password } = req.body || {}
  if (!email || !password) return res.status(400).json({ error: 'Missing fields.' })

  const validEmail    = process.env.ADMIN_EMAIL
  const validPassword = process.env.ADMIN_PASSWORD

  if (email.trim().toLowerCase() !== validEmail.toLowerCase() || password !== validPassword) {
    return res.status(401).json({ error: 'Invalid credentials.' })
  }

  return res.status(200).json({ success: true })
}
