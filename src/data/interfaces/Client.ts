export enum AgeGroup {
  UNDER_18 = "до 18 лет",
  FROM_18_TO_25 = "18-25 лет",
  FROM_26_TO_35 = "26-35 лет",
  FROM_36_TO_45 = "36-45 лет",
  FROM_46_TO_60 = "46-60 лет",
  OVER_60 = "60+ лет",
}

export enum Gender {
  MALE = "мужской",
  FEMALE = "женский",
}

export enum LocationPreference {
  VERY_IMPORTANT = "очень важно",
  NOT_IMPORTANT = "не имеет значения",
  ONLINE_PREFERRED = "предпочитаю онлайн",
}

export enum UsageFrequency {
  FIRST_TIME = "впервые",
  FEW_TIMES_A_YEAR = "несколько раз в год",
  ONCE_A_MONTH = "раз в месяц",
  WEEKLY_OR_MORE = "раз в неделю и чаще",
}

export enum SourceType {
  SOCIAL_NETWORKS = "социальные сети",
  RECOMMENDATIONS = "рекомендации друзей",
  INTERNET_SEARCH = "поиск в интернете",
  OTHER = "другое",
}

export enum UsagePurpose {
  PERSONAL = "для личных нужд",
  BUSINESS = "для работы/бизнеса",
}

export interface Client {
  id: number
  name: string
  email: string
  phone: string
  ageGroup: AgeGroup
  gender: Gender
  profession: string
  region: string
  locationPreference: LocationPreference
  usageFrequency: UsageFrequency
  source: SourceType
  socialNetwork?: string
  usagePurpose: UsagePurpose
  clientSince: Date
  segmentId?: number
  createdAt: Date
  updatedAt: Date
}

export interface ClientCreateDto {
  name: string
  email: string
  phone: string
  ageGroup: AgeGroup
  gender: Gender
  profession?: string
  region: string
  locationPreference?: LocationPreference
  usageFrequency?: UsageFrequency
  source?: SourceType
  socialNetwork?: string
  usagePurpose?: UsagePurpose
  segmentId?: number
}

export interface ClientUpdateDto {
  name?: string
  email?: string
  phone?: string
  ageGroup?: AgeGroup
  gender?: Gender
  profession?: string
  region?: string
  locationPreference?: LocationPreference
  usageFrequency?: UsageFrequency
  source?: SourceType
  socialNetwork?: string
  usagePurpose?: UsagePurpose
  segmentId?: number
}
