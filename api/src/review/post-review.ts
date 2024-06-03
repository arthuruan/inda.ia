import { Request, Response } from 'express'
import { openaiClient } from '../openai/openai-client'
import { contentFormatter, Requirement } from './helpers/content-formatter'
import { extractRepoDetails } from '../github/extract-repo-details'
import { fetchAndConcatenateCode } from '../github/fetch-code'

type Body = {
    requirements: Requirement[]
    githubUrl: string
    extensions: string[]
}

export const postReviewHandler = async (req: Request<Body>, res: Response) => {
    try {
        const { requirements, githubUrl, extensions } = req.body
        if (!requirements && !githubUrl && !extensions) {
            return res.status(400).send('Invalid request body.')
        }

        const { branch, repoName, author } = await extractRepoDetails(githubUrl)
        const code = await fetchAndConcatenateCode(author, repoName, extensions, branch)
        // const code = mockCode

        const openai = openaiClient()
        const completion = await openai.chat.completions.create({
            messages: [{ role: 'system', content: contentFormatter(requirements, code) }],
            model: 'gpt-4-turbo',
        })

        res.send(JSON.parse(completion.choices[0].message.content as string))
    } catch (err: any) {
        console.error(err)
        res.sendStatus(500).send({
            message: err.message || err.errorMessage || 'Internal Server Error',
        })
    }
}
