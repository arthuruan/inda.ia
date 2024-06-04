import { Request, Response } from 'express'
import { openaiClient } from '../openai/openai-client'
import { contentFormatter, Requirement } from './helpers/content-formatter'
import { readFiles } from '../github/read-code'

type Body = {
    requirements: Requirement[]
    githubUrl: string
    extensions: string[]
}

type ReviewResult = {
    pros: Requirement[]
    cons: Requirement[]
    rate: number
    overview: string
}

export const postReviewHandler = async (req: Request<Body>, res: Response) => {
    try {
        const { requirements, githubUrl, extensions } = req.body
        if (!requirements && !githubUrl && !extensions) {
            return res.status(400).send('Invalid request body.')
        }

        const code = await readFiles(githubUrl, extensions)

        const openai = openaiClient()
        const completion = await openai.chat.completions.create({
            messages: [{ role: 'system', content: contentFormatter(requirements, code) }],
            model: 'gpt-4-turbo',
        })

        let review: ReviewResult = {
            pros: [],
            cons: [],
            rate: 0,
            overview: '',
        }

        completion.choices.forEach((choice) => {
            try {
                review = JSON.parse(choice.message.content as string)
            } catch (err: any) {
                console.error(err)
            }
        })

        res.send(review)
    } catch (err: any) {
        console.error(err)
        res.sendStatus(500).send({
            message: err.message || err.errorMessage || 'Internal Server Error',
        })
    }
}
