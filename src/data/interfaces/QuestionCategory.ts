export interface QuestionCategory {
  id: number
  name: string
  description: string
  createdAt: Date
  updatedAt: Date
}

export interface QuestionCategoryCreateDto {
  name: string
  description: string
}

export interface QuestionCategoryUpdateDto {
  name?: string
  description?: string
}
