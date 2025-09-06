import { Octokit } from "@octokit/rest"

// Konfigurasi diambil dari Environment Variables
const GITHUB_TOKEN = process.env.GITHUB_TOKEN
const GITHUB_USERNAME = 'ramacoded'
const REPO_NAME = 'security-database'
const FILE_PATH = 'number.json'

const octokit = new Octokit({ auth: GITHUB_TOKEN })

async function getFileSha() {
  try {
    const { data } = await octokit.repos.getContent({
      owner: GITHUB_USERNAME,
      repo: REPO_NAME,
      path: FILE_PATH,
    })
    return data.sha
  } catch (error) {
    if (error.status === 404) {
      return null // File belum ada
    }
    throw error
  }
}

export default async function handler(req, res) {
  const repoDetails = {
    owner: GITHUB_USERNAME,
    repo: REPO_NAME,
    path: FILE_PATH,
  }

  // --- READ (GET) ---
  if (req.method === 'GET') {
    try {
      const { data } = await octokit.repos.getContent(repoDetails)
      const content = Buffer.from(data.content, 'base64').toString('utf-8')
      res.status(200).json(JSON.parse(content))
    } catch (error) {
      if (error.status === 404) {
        res.status(200).json([]) // Jika file tidak ada, kembalikan array kosong
      } else {
        res.status(500).json({ message: 'Failed to fetch data from GitHub.' })
      }
    }
    return
  }

  // --- WRITE (POST) ---
  if (req.method === 'POST') {
    try {
      const newData = req.body // Client mengirim seluruh array yang sudah diperbarui
      const content = Buffer.from(JSON.stringify(newData, null, 2)).toString('base64')
      const sha = await getFileSha()

      await octokit.repos.createOrUpdateFileContents({
        ...repoDetails,
        message: `Update database via web app ${new Date().toISOString()}`,
        content: content,
        sha: sha,
      })
      res.status(200).json({ success: true, message: 'Database updated.' })
    } catch (error) {
      res.status(500).json({ message: 'Failed to update data on GitHub.' })
    }
    return
  }

  res.status(405).json({ message: 'Method Not Allowed' })
}