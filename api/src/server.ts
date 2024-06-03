import express from 'express'

import { postReviewHandler } from './review/post-review'

const app = express()

app.use(express.json())
app.post('/review', postReviewHandler)

app.listen(3000)
