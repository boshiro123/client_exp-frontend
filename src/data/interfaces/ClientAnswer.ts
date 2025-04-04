export interface ClientAnswer {
  id: number
  clientId: number
  surveyId: number
  questionId: number
  answerOptionId?: number
  textAnswer?: string
  numericAnswer?: number
  createdAt: Date
}

export interface ClientAnswerCreateDto {
  clientId: number
  surveyId: number
  questionId: number
  answerOptionId?: number
  textAnswer?: string
  numericAnswer?: number
}

export interface ClientAnswerBulkCreateDto {
  clientId: number
  surveyId: number
  answers: {
    questionId: number
    answerOptionId?: number
    textAnswer?: string
    numericAnswer?: number
  }[]
}

export interface ClientAnswerSummary {
  questionId: number
  questionText: string
  answerOptionId?: number
  answerText?: string
  textAnswer?: string
  numericAnswer?: number
}
