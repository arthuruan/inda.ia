import { Requirement } from '../../App'
import './style.css'
import lampIcon from '../../assets/lamp-light.svg'
import starIcon from '../../assets/start-light.svg'
import checkIcon from '../../assets/check-light.svg'
import closeIcon from '../../assets/close-light.svg'

type Evaluation = {
    pros: Requirement[]
    cons: Requirement[]
    rate: number
    overview: string
}

export const Evaluation = ({ evaluation }: { evaluation: Evaluation }) => {
    return (
        <div className="evaluation-wrapper">
            <div className="overview">
                <div className="badge overview">Overview</div>
                <div className="overview-text">
                    <img src={lampIcon} alt="lamp-icon" />
                    <p>{evaluation.overview}</p>
                </div>
                <div className="overview-rate">
                    <img src={starIcon} alt="star-icon" />
                    <p>{evaluation.rate} / 5</p>
                </div>
            </div>
            <div className="pros">
                <div className="badge pros">Pros</div>
                <div className="list">
                    {evaluation.pros.map((pro, index) => (
                        <div className="item">
                            <img src={checkIcon} alt="check-icon" />
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
                    {evaluation.cons.map((cons, index) => (
                        <div className="item">
                            <img src={closeIcon} alt="close-icon" />
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
