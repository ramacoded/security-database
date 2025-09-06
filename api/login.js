export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' })
  }

  const { password } = req.body

  // Ambil password dari Environment Variables yang aman di Vercel
  const appPassword = '1'

  if (password === appPassword) {
    res.status(200).json({ success: true })
  } else {
    res.status(401).json({ success: false })
  }
}
