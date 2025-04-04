export interface Segment {
  id: number
  name: string
  description: string
  criteria: string
  createdAt: Date
  updatedAt: Date
}

export interface SegmentCreateDto {
  name: string
  description: string
  criteria: string
}

export interface SegmentUpdateDto {
  name?: string
  description?: string
  criteria?: string
}

export interface ClientSegmentAssignment {
  clientId: number
  segmentId: number
  createdAt: Date
}
