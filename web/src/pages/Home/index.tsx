import './styles.css'
import React, { useState } from 'react'
import api from '../../services/api'
import logoIcon from '../../assets/logo.svg'
import { ReviewForm, ReviewPayload } from '../../components/ReviewForm'
import { Review } from '../../components/Review'
import defaultRequirementsJson from '../../default-requirements.json'

export type Requirement = {
    topic: string
    description: string
}

type EvaluationResult = {
    pros: Requirement[]
    cons: Requirement[]
    rate: number
    overview: string
}

export const Home: React.FC = () => {
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [gitInfo, setGitInfo] = useState<{ owner: string; repo: string }>({
        owner: '',
        repo: '',
    })
    const [review, setReview] = useState<EvaluationResult | undefined>(undefined)
    const [defaultRequirements, setDefaultRequirements] = useState<Requirement[]>([])

    const setGitInfoFromUrl = (url: string) => {
        const urlParts = url.split('/')
        if (urlParts.length >= 4) {
            setGitInfo({
                owner: urlParts[urlParts.length - 2],
                repo: urlParts[urlParts.length - 1],
            })
        }
    }

    const onSubmit = async (payload: ReviewPayload) => {
        if (!payload.githubUrl || !payload.requirements.length || !payload.extensions.length) {
            alert('Please fill all fields')
            return
        }

        setGitInfoFromUrl(payload.githubUrl)

        setIsLoading(true)
        try {
            const response = await api.post<EvaluationResult>('/review', {
                ...payload,
            })
            setIsLoading(false)
            setReview(response.data)
        } catch (err: any) {
            alert('Error fetching review')
            setIsLoading(false)
            console.error('Error fetching review', err)
        }
    }

    return (
        <main className="container">
            <div className="img-container">
                <img
                    src={logoIcon}
                    alt="logoIcon"
                    onClick={() => {
                        if (!defaultRequirements.length) {
                            setDefaultRequirements(defaultRequirementsJson.requirements as Requirement[])
                        }
                    }}
                />
            </div>

            <div className="wrapper">
                <div style={{ justifyContent: review ? 'flex-end' : 'center' }} className="left">
                    <ReviewForm defaultRequirements={defaultRequirements} isLoading={isLoading} onSubmit={onSubmit} />
                </div>
                {review && (
                    <div className="right">
                        <Review review={review} gitInfo={gitInfo} />
                    </div>
                )}
            </div>
        </main>
    )
}
