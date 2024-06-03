export type Requirement = {
    topic: string
    description: string
}

export const contentFormatter = (requirements: Requirement[], code: string) => {
    const prefix = "You're a code reviewer, and you've been asked to review if the code is following only the bellow requirements: "
    const body = requirements.map((req) => `${req.topic}: ${req.description}`).join(', ')
    const suffix = `. 
    You're going to answer in json format using the structure { \"pros\": [{"topic": string, "description": string }], \"cons\": [{"topic": string, "description": string }], "rate": number, "overview": string }.
    Where your pros are the matching requirements and cons are the requirements that are not matching, each one are a list of the values, for rate try to rate the overall project in a rate between 0 to 5, and also give a overview of the code. Do not return in \`\`\`json format.
    `
    return prefix + body + suffix + code
}
