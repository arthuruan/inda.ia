import express from 'express'
import cors from 'cors'

import { postReviewHandler } from './review/post-review'

const app = express()

app.use(cors())
app.use(express.json())
app.post('/review', postReviewHandler)

app.listen(3333)
