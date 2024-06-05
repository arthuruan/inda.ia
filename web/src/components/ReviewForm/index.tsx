import React, { useEffect, useState } from 'react'
import './styles.css'
import { Requirement } from '../../pages/Home'
import { Button, CloseButton } from '@chakra-ui/react'
import trashIcon from '../../assets/trash_light.svg'
import requirementIcon from '../../assets/Blank_alt_light.svg'
import requirementButtonIcon from '../../assets/req-left-icon.svg'
import evaluateButtonIcon from '../../assets/eval-left-icon.svg'

export type ReviewPayload = {
    requirements: Requirement[]
    githubUrl: string
    extensions: string[]
}

export const ReviewForm = ({ isLoading, onSubmit, defaultRequirements }: { isLoading: boolean; onSubmit: (payload: ReviewPayload) => void; defaultRequirements: Requirement[] }) => {
    const [formData, setFormData] = useState<ReviewPayload>({
        requirements: [],
        githubUrl: '',
        extensions: [],
    })
    const [extension, setExtension] = useState<string>('')
    const [requirement, setRequirement] = useState<Requirement>({ topic: '', description: '' })

    useEffect(() => {
        setFormData((prevFormData: ReviewPayload) => ({
            ...prevFormData,
            requirements: [...defaultRequirements],
        }))
    }, [defaultRequirements])

    const handleChange = (event: any) => {
        const { name, value } = event.target
        setFormData((prevFormData: ReviewPayload) => ({ ...prevFormData, [name]: value }))
    }

    const handleAddExtension = (event: any) => {
        event.preventDefault()
        if (extension) {
            setFormData((prevFormData: ReviewPayload) => ({
                ...prevFormData,
                extensions: [...prevFormData.extensions, extension],
            }))
            setExtension('')
        }
    }

    const handleRemoveExtension = (index: number) => {
        setFormData((prevFormData: ReviewPayload) => ({
            ...prevFormData,
            extensions: prevFormData.extensions.filter((_, i) => i !== index),
        }))
    }

    const handleAddRequirement = (event: any) => {
        event.preventDefault()
        if (requirement.topic && requirement.description) {
            setFormData((prevFormData: ReviewPayload) => ({
                ...prevFormData,
                requirements: [...prevFormData.requirements, requirement],
            }))
            setRequirement({ topic: '', description: '' })
        }
    }

    const handleRemoveRequirement = (index: number) => {
        setFormData((prevFormData: ReviewPayload) => ({
            ...prevFormData,
            requirements: prevFormData.requirements.filter((_, i) => i !== index),
        }))
    }

    return (
        <div className="container-review-form">
            {/* Repository */}
            <label htmlFor="githubUrl">Repository</label>
            <input disabled={isLoading} className="input-1" placeholder="https://example.com.git" type="text" id="githubUrl" name="githubUrl" value={formData.githubUrl} onChange={handleChange} />
            {/* Extensions */}
            <label htmlFor="extensions">Extensions</label>
            <form onSubmit={handleAddExtension}>
                <div className="extensions">
                    <input
                        disabled={isLoading}
                        className="extension-input"
                        placeholder="New Extension"
                        type="text"
                        id="githubUrl"
                        name="githubUrl"
                        value={extension}
                        onChange={(event) => setExtension(event.target.value as string)}
                    />
                    {formData.extensions.map((ext, index) => (
                        <div key={index} className="extension-item">
                            <span>{ext}</span>
                            <CloseButton onClick={() => handleRemoveExtension(index)} />
                        </div>
                    ))}
                </div>
            </form>
            {/* Requirements */}
            <label>Requirements</label>
            {formData.requirements.map((req, index) => (
                <div className="requirements-list" key={index}>
                    <img style={{ marginTop: 5 }} onClick={() => handleRemoveRequirement(index)} src={trashIcon} alt="trashIcon" />
                    <div style={{ marginLeft: 12, marginBottom: 24 }}>
                        <span className="topic">{req.topic}</span>
                        <p className="description">{req.description}</p>
                    </div>
                </div>
            ))}
            <div className="requirements">
                <img src={requirementIcon} alt="requirementIcon" />
                <div className="requirements-inputs">
                    <input
                        disabled={isLoading}
                        type="text"
                        placeholder="Topic"
                        className="requirement-input topic"
                        value={requirement.topic}
                        onChange={(event) =>
                            setRequirement({
                                ...requirement,
                                topic: event.target.value,
                            })
                        }
                    />
                    <textarea
                        disabled={isLoading}
                        placeholder="Description"
                        className="requirement-input"
                        value={requirement.description}
                        onChange={(event) =>
                            setRequirement({
                                ...requirement,
                                description: event.target.value,
                            })
                        }
                    />
                </div>
            </div>
            <Button style={{ width: '100%' }} colorScheme="blue" variant="outline" onClick={handleAddRequirement} disabled={isLoading}>
                <img style={{ marginRight: 8 }} src={requirementButtonIcon} alt="requirimentButtonIcon" />
                New Requirement
            </Button>
            <Button style={{ marginTop: 24, width: '100%' }} colorScheme="blue" onClick={() => onSubmit(formData)} isLoading={isLoading}>
                <img style={{ marginRight: 8 }} src={evaluateButtonIcon} alt="evaluteButtonIcon" />
                Evaluate
            </Button>
        </div>
    )
}
