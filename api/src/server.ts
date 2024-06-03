import express from 'express';

const app = express()
app.use(express.json())

const port = 3000

import OpenAI from "openai"
const openai = new OpenAI()

const contentFormatter = (requirementPayload: RequirementsPayload[], code: string) => {
    const prefix = "You're a code reviewer, and you've been asked to review if the code is following only the bellow requirements: "
    const body = requirementPayload.map(req => `${req.topic}: ${req.description}`).join(", ")
    const suffix = `. 
    You're going to answer in json format using the structure { \"pros\": [{"topic": string, "description": string }], \"cons\": [{"topic": string, "description": string }] }.
    Where your pros are the matching requirements and cons are the requirements that are not matching, each one are a list of the values.
    `

    const requirements = prefix + body + suffix

    return requirements + code;
}

type RequirementsPayload = {
    topic: string,
    description: string
}

app.post('/review', async (req, res) => {
    const { requirements, code }: { requirements: RequirementsPayload[], code: string } = req.body;

    if (!requirements && !code) {
        return res.status(400).send("Invalid request body.");
    }

    const completion = await openai.chat.completions.create({
        messages: [{ role: "system", content: contentFormatter(requirements, code)  }],
        model: "gpt-4-turbo",
    });

    res.send(JSON.parse(completion.choices[0].message.content as string));
});


app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});