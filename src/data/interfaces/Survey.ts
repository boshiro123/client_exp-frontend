export enum SurveyStatus {
  ACTIVE = "активный",
  COMPLETED = "завершенный",
  DRAFT = "черновик",
}

export interface Survey {
  id: number
  title: string
  description: string
  status: SurveyStatus
  startDate: Date
  endDate: Date
  createdBy: number
  createdAt: Date
  updatedAt: Date
}

export interface SurveyCreateDto {
  title: string
  description: string
  status: SurveyStatus
  startDate: Date
  endDate: Date
}

export interface SurveyUpdateDto {
  title?: string
  description?: string
  status?: SurveyStatus
  startDate?: Date
  endDate?: Date
}

export interface SurveySegmentAssignment {
  surveyId: number
  segmentId: number
  createdAt: Date
}
