import { AnswerOption } from "./AnswerOption"
import { QuestionCategory } from "./QuestionCategory"

export enum QuestionType {
  SINGLE_CHOICE = "single_choice",
  MULTIPLE_CHOICE = "multiple_choice",
  TEXT = "text",
  RATING = "rating",
}

export enum MetricType {
  CSAT = "CSAT",
  NPS = "NPS",
  CES = "CES",
  NONE = "none",
}

export interface Question {
  id: number
  surveyId: number
  text: string
  type: QuestionType
  required: boolean
  orderNumber: number
  categoryId: number
  metricType: MetricType
  createdAt: Date
  updatedAt: Date
}

export interface QuestionWithRelations extends Question {
  answerOptions?: AnswerOption[]
  category?: QuestionCategory
}

export interface QuestionCreateDto {
  surveyId: number
  text: string
  type: QuestionType
  required: boolean
  orderNumber: number
  categoryId: number
  metricType: MetricType
}

export interface QuestionUpdateDto {
  text?: string
  type?: QuestionType
  required?: boolean
  orderNumber?: number
  categoryId?: number
  metricType?: MetricType
}

export interface QuestionSummary {
  id: number
  text: string
  type: QuestionType
  required: boolean
  answerOptions?: AnswerOption[]
}
