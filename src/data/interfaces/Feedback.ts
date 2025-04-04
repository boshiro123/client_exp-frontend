export interface Feedback {
  id: number
  clientId: number
  satisfactionScore: number
  npsScore: number
  cesScore: number
  positiveAspects: string[]
  improvementSuggestions?: string
  createdAt: Date
  updatedAt: Date
}

export interface FeedbackCreateDto {
  clientId: number
  satisfactionScore: number
  npsScore: number
  cesScore: number
  positiveAspects: string[]
  improvementSuggestions?: string
}

export interface FeedbackUpdateDto {
  satisfactionScore?: number
  npsScore?: number
  cesScore?: number
  positiveAspects?: string[]
  improvementSuggestions?: string
}

export interface FeedbackSummary {
  clientId: number
  clientName: string
  satisfactionScore: number
  npsScore: number
  cesScore: number
  createdAt: Date
}
