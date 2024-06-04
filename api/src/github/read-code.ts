import simpleGit from 'simple-git'
import * as fs from 'fs'
import * as path from 'path'

const git = simpleGit()

interface CloneAndReadRequest {
    repositoryUrl: string
    extensions: string[]
}

const readFilesRecursively = (dir: string, extensions: string[], basePath: string = ''): string => {
    let result = ''
    const files = fs.readdirSync(dir, { withFileTypes: true })

    files.forEach((file) => {
        const relativePath = path.join(basePath, file.name)
        if (file.isDirectory()) {
            result += readFilesRecursively(path.join(dir, file.name), extensions, relativePath)
        } else if (extensions.some((ext) => file.name.endsWith(ext))) {
            const content = fs.readFileSync(path.join(dir, file.name), 'utf8')
            result += `File: ${relativePath}\n\n${content}\n\n`
        }
    })

    return result
}

export async function readFiles(repositoryUrl: string, extensions: [string]) {
    if (!repositoryUrl || !extensions) {
        throw new Error('Repository URL and extensions are required')
    }

    try {
        // Clone the repository into a temporary directory
        const tmpDir = `./tmp/${Date.now()}`
        await git.clone(repositoryUrl, tmpDir)

        // Read the contents of each file, including its path
        const combinedContents = readFilesRecursively(tmpDir, extensions)

        // Clean up: Remove the cloned repository directory
        fs.rmdirSync(tmpDir, { recursive: true })

        return combinedContents
    } catch (error) {
        console.error('Error processing request:', error)
        throw new Error('Internal Server Error')
    }
}
