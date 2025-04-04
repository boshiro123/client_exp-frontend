export interface AnswerOption {
  id: number
  questionId: number
  text: string
  orderNumber: number
  createdAt: Date
  updatedAt: Date
}

export interface AnswerOptionCreateDto {
  questionId: number
  text: string
  orderNumber: number
}

export interface AnswerOptionUpdateDto {
  text?: string
  orderNumber?: number
}

export interface AnswerOptionBulkCreateDto {
  questionId: number
  options: Omit<AnswerOptionCreateDto, "questionId">[]
}
