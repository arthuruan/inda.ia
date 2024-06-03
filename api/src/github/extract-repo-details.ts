import axios from 'axios'
import { GITHUB_API_BASE_URL } from './githut-api-base-url'

type RepoDetails = {
    author: string
    repoName: string
    branch: string
}

export async function extractRepoDetails(githubUrl: string): Promise<RepoDetails> {
    const urlPattern = /https?:\/\/github\.com\/([^\/]+)\/([^\/]+)(\/tree\/([^\/]+))?/
    const match = githubUrl.match(urlPattern)

    if (!match) {
        throw new Error('Invalid GitHub URL')
    }

    const author = match[1]
    const repoName = match[2]
    let branch = match[4]

    if (!branch) {
        try {
            const response = await axios.get(`${GITHUB_API_BASE_URL}/repos/${author}/${repoName}`)
            branch = response.data.default_branch
        } catch (error) {
            console.error(error)
            throw new Error('Invalid GitHub URL')
        }
    }

    return { author, repoName, branch }
}
