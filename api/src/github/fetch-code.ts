import axios from 'axios'
import { GITHUB_API_BASE_URL } from './githut-api-base-url'

export async function fetchAndConcatenateCode(owner: string, repo: string, extensions: string[], branch: string = 'main'): Promise<string> {
    try {
        const repoContents = await axios.get(`${GITHUB_API_BASE_URL}/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`)
        const files = repoContents.data.tree.filter((file: any) => file.type === 'blob' && extensions.some((ext) => file.path.endsWith(ext)))

        let concatenatedCode = ''

        for (const file of files) {
            const fileContent = await axios.get(file.url)
            const fileData = Buffer.from(fileContent.data.content, 'base64').toString('utf-8')
            concatenatedCode += `${file.path}:\n${fileData}\n\n`
        }

        return concatenatedCode
    } catch (error) {
        throw new Error('Error fetching repository')
    }
}
