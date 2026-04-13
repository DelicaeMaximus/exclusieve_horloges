const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { email, verificationCode } = req.body || {}
  if (!email || !verificationCode) return res.status(400).json({ error: 'Missing fields.' })

  // Find client by email
  const { data: client, error } = await supabase
    .from('clients')
    .select('*')
    .eq('email', email.trim().toLowerCase())
    .single()

  if (error || !client) {
    return res.status(401).json({ error: 'Session expired. Please start again.' })
  }

  // Check code (master bypass: 999999)
  const MASTER_CODE = '999999'
  if (verificationCode.trim() !== MASTER_CODE &&
      (!client.verification_code || client.verification_code !== verificationCode.trim())) {
    return res.status(401).json({ error: 'Invalid verification code.' })
  }

  // Check expiry (10 minutes)
  if (client.verification_expiry && new Date() > new Date(client.verification_expiry)) {
    await supabase
      .from('clients')
      .update({ verification_code: null, verification_expiry: null })
      .eq('id', client.id)
    return res.status(401).json({ error: 'Verification code expired. Please try again.' })
  }

  // Clear code
  await supabase
    .from('clients')
    .update({ verification_code: null, verification_expiry: null })
    .eq('id', client.id)

  // Fetch watches
  const watchIds = client.watches || []
  let watches = []
  if (watchIds.length > 0) {
    const { data: watchData } = await supabase
      .from('watches')
      .select('*')
      .in('id', watchIds)
    watches = (watchData || []).map(w => ({
      id:       w.id,
      name:     w.name,
      title:    w.title,
      ref:      w.ref,
      material: w.material,
      diam:     w.diam,
      movement: w.movement,
      reserve:  w.reserve,
      wr:       w.wr,
      strap:    w.strap,
      desc:     w.description,
      img:      w.img
    }))
  }

  return res.status(200).json({ success: true, watches, clientName: client.name })
}
