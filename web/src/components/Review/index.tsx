import { Requirement } from '../../pages/Home'
import './style.css'
import lampIcon from '../../assets/lamp-light.svg'
import starIcon from '../../assets/start-light.svg'
import checkIcon from '../../assets/check-light.svg'
import closeIcon from '../../assets/close-light.svg'
import React from 'react'

type Review = {
    pros: Requirement[]
    cons: Requirement[]
    rate: number
    overview: string
}

export const Review = ({ review, gitInfo }: { review: Review; gitInfo: { owner: string; repo: string } }) => {
    return (
        <div className="container-review">
            <h1 className="github-info">
                {gitInfo.owner}/{gitInfo.repo}
            </h1>
            <div className="overview">
                <div className="badge overview">Overview</div>
                <div className="overview-text">
                    <img style={{ marginTop: 2 }} src={lampIcon} alt="lamp-icon" />
                    <p>{review.overview}</p>
                </div>
                <div className="overview-rate">
                    <img src={starIcon} alt="star-icon" />
                    <p>{review.rate} / 5</p>
                </div>
            </div>
            <div className="pros">
                <div className="badge pros">Pros</div>
                <div className="list">
                    {review.pros.map((pro, index) => (
                        <div className="item">
                            <img style={{ marginTop: 2 }} src={checkIcon} alt="check-icon" />
                            <div className="text">
                                <p className="topic">{pro.topic}</p>
                                <p className="description">{pro.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="cons">
                <div className="badge cons">Cons</div>
                <div className="list">
                    {review.cons.map((cons, index) => (
                        <div className="item">
                            <img style={{ marginTop: 2 }} src={closeIcon} alt="close-icon" />
                            <div className="text">
                                <p className="topic">{cons.topic}</p>
                                <p className="description">{cons.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
