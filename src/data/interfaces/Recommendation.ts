export interface RecommendationTemplate {
  id: number
  segmentId: number
  title: string
  content: string
  createdBy: number
  createdAt: Date
  updatedAt: Date
}

export interface RecommendationTemplateCreateDto {
  segmentId: number
  title: string
  content: string
  createdBy: number
}

export interface RecommendationTemplateUpdateDto {
  segmentId?: number
  title?: string
  content?: string
}

export enum RecommendationStatus {
  NEW = "новая",
  VIEWED = "просмотрена",
  APPLIED = "применена",
}

export interface Recommendation {
  id: number
  clientId: number
  templateId: number
  content: string
  status: RecommendationStatus
  createdAt: Date
  updatedAt: Date
}

export interface RecommendationCreateDto {
  clientId: number
  templateId: number
  content: string
  status: RecommendationStatus
}

export interface RecommendationUpdateDto {
  status?: RecommendationStatus
}

export interface RecommendationFilterDto {
  clientId?: number
  status?: RecommendationStatus
  segmentId?: number
  startDate?: Date
  endDate?: Date
}

export interface RecommendationWithTemplateInfo extends Recommendation {
  templateTitle: string
  segmentName: string
}
