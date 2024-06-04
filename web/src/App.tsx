import './App.css'
import React, { useState } from 'react'
import requirementIcon from './assets/Blank_alt_light.svg'
import evaluateButtonIcon from './assets/eval-left-icon.svg'
import requirementButtonIcon from './assets/req-left-icon.svg'
import trashIcon from './assets/trash_light.svg'
import logoIcon from './assets/logo.svg'
import { Button, Center, CloseButton, Container, FormLabel, HStack, Text, VStack } from '@chakra-ui/react'
import { Evaluation } from './components/evaluation'
import api from './services/ api'
import requirementsTemplate from './requirements-template.json'

export type Requirement = {
    topic: string
    description: string
}

type ReviewPayload = {
    requirements: Requirement[]
    githubUrl: string
    extensions: string[]
}

type EvaluationResult = {
    pros: Requirement[]
    cons: Requirement[]
    rate: number
    overview: string
}

function App() {
    const [formData, setFormData] = useState<ReviewPayload>({
        requirements: [],
        githubUrl: '',
        extensions: [],
    })
    const [extension, setExtension] = useState<string>('')
    const [requirement, setRequirement] = useState<Requirement>({ topic: '', description: '' })
    const [evaluation, setEvaluation] = useState<EvaluationResult | undefined>(undefined)
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [gitInfo, setGitInfo] = useState<{ owner: string; repo: string }>({
        owner: '',
        repo: '',
    })

    const handleChange = (event: any) => {
        const { name, value } = event.target
        setFormData((prevFormData: ReviewPayload) => ({ ...prevFormData, [name]: value }))
    }

    const setGitInfoFromUrl = (url: string) => {
        const urlParts = url.split('/')
        if (urlParts.length >= 4) {
            setGitInfo({
                owner: urlParts[urlParts.length - 2],
                repo: urlParts[urlParts.length - 1],
            })
        }
    }

    const handleSubmit = async (event: any) => {
        event.preventDefault()
        if (!formData.githubUrl || !formData.requirements.length || !formData.extensions.length) {
            alert('Please fill all fields')
            return
        }

        setGitInfoFromUrl(formData.githubUrl)

        setIsLoading(true)
        try {
            const response = await api.post<EvaluationResult>('/review', {
                ...formData,
            })
            setIsLoading(false)
            setEvaluation(response.data)
        } catch (err: any) {
            alert('Error fetching review')
            setIsLoading(false)
            console.error('Error fetching review', err)
        }
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
        <Center className="App">
            <img
                src={logoIcon}
                alt="logoIcon"
                onClick={() => {
                    setFormData((prevFormData: ReviewPayload) => ({
                        ...prevFormData,
                        requirements: [...requirementsTemplate.requirements],
                    }))
                }}
            />
            <HStack className="wrapper">
                <Container className="wrapper-left">
                    <FormLabel htmlFor="githubUrl">Repository</FormLabel>
                    <input
                        disabled={isLoading}
                        className="input-1"
                        placeholder="https://example.com.git"
                        type="text"
                        id="githubUrl"
                        name="githubUrl"
                        value={formData.githubUrl}
                        onChange={handleChange}
                    />
                    <FormLabel htmlFor="extensions">Extensions</FormLabel>
                    <form onSubmit={handleAddExtension}>
                        <HStack className="extension-container">
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
                            {formData.extensions.map((extension, index) => (
                                <HStack className="extension-item" key={index}>
                                    <Text>{extension}</Text>
                                    <CloseButton onClick={() => handleRemoveExtension(index)} />
                                </HStack>
                            ))}
                        </HStack>
                    </form>
                    <FormLabel htmlFor="requirements">Requirements</FormLabel>
                    {formData.requirements.map((requirementItem, index) => (
                        <HStack
                            style={{
                                marginBottom: 24,
                                alignItems: 'flex-start',
                            }}
                            key={index}
                        >
                            <img style={{ marginTop: 5 }} onClick={() => handleRemoveRequirement(index)} src={trashIcon} alt="trashIcon" />
                            <VStack
                                style={{
                                    width: '100%',
                                    gap: 0,
                                    alignItems: 'flex-start',
                                }}
                            >
                                <Text style={{ fontWeight: 'bolder', fontSize: 18 }}>{requirementItem.topic}</Text>
                                <Text style={{ fontSize: 16 }}>{requirementItem.description}</Text>
                            </VStack>
                        </HStack>
                    ))}
                    <HStack className="requirement-form-container">
                        <img style={{ marginTop: 5 }} src={requirementIcon} alt="requirementIcon" />
                        <VStack
                            style={{
                                width: '100%',
                                gap: 0,
                                marginBottom: 8,
                            }}
                        >
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
                        </VStack>
                    </HStack>
                    <Button colorScheme="blue" variant="outline" onClick={handleAddRequirement} disabled={isLoading}>
                        <img style={{ marginRight: 8 }} src={requirementButtonIcon} alt="requirimentButtonIcon" />
                        New Requirement
                    </Button>
                    <Button style={{ marginTop: 24, marginRight: 8 }} colorScheme="blue" onClick={handleSubmit} isLoading={isLoading}>
                        <img src={evaluateButtonIcon} alt="evaluteButtonIcon" />
                        Evaluate
                    </Button>
                </Container>
                {evaluation && (
                    <Container className="wrapper-right">
                        {gitInfo.owner && gitInfo.repo && (
                            <h1 className="github-info">
                                {gitInfo.owner}/{gitInfo.repo}
                            </h1>
                        )}
                        <Evaluation evaluation={evaluation} />
                    </Container>
                )}
            </HStack>
        </Center>
    )
}

export default App
