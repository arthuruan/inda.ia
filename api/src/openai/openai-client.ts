import OpenAI from 'openai'

let openai: OpenAI

export const openaiClient = () => {
    if (!openai) {
        openai = new OpenAI()
    }
    return openai
}
