export enum ReportType {
  SATISFACTION = "удовлетворенность",
  SEGMENTATION = "сегментация",
  GENERAL_ANALYTICS = "общая аналитика",
}

export enum ReportFormat {
  PDF = "PDF",
  EXCEL = "Excel",
}

export interface Report {
  id: number
  title: string
  type: ReportType
  parameters: Record<string, any>
  createdBy: number
  filePath: string
  format: ReportFormat
  createdAt: Date
}

export interface ReportCreateDto {
  title: string
  type: ReportType
  parameters: Record<string, any>
  format: ReportFormat
}

export interface ReportFilterDto {
  type?: ReportType
  createdBy?: number
  startDate?: Date
  endDate?: Date
}

export interface ReportWithUserInfo extends Report {
  userName: string
}
