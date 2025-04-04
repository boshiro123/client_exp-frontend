export enum InteractionType {
  SURVEY = "опрос",
  FEEDBACK = "отзыв",
  INQUIRY = "обращение",
  PURCHASE = "покупка",
}

export interface ClientInteraction {
  id: number
  clientId: number
  type: InteractionType
  description: string
  createdBy: number
  createdAt: Date
}

export interface ClientInteractionCreateDto {
  clientId: number
  type: InteractionType
  description: string
  createdBy: number
}

export interface ClientInteractionFilterDto {
  clientId?: number
  type?: InteractionType
  startDate?: Date
  endDate?: Date
}

export interface ClientInteractionWithUserInfo extends ClientInteraction {
  userName: string
}
