import { Policy } from './policy'

export interface ContributionRecord {
  id: string
  memberId: string
  memberAddress: string
  period: string
  amount: string
  network: string
  txHash?: string
  status: 'pending' | 'completed' | 'failed'
  error?: string
  createdAt: Date
  updatedAt: Date
}

export interface MemberAuth {
  memberId: string
  memberAddress: string
  grantedAt: Date
  expiresAt: Date
  revokedAt?: Date
  isActive: boolean
}

export interface SavingsCircle {
  id: string
  name: string
  description: string
  contributionAmount: string
  frequency: 'weekly' | 'biweekly' | 'monthly'
  maxMembers: number
  createdAt: Date
}

export interface Member {
  id: string
  circleId: string
  memberAddress: string
  privyDID: string
  joinedAt: Date
  isActive: boolean
  currentPeriod: string
}

export interface ContributionStore {
  members: Map<string, Member>
  auths: Map<string, MemberAuth>
  contributions: Map<string, ContributionRecord>
  circles: Map<string, SavingsCircle>
}

export const store: ContributionStore = {
  members: new Map(),
  auths: new Map(),
  contributions: new Map(),
  circles: new Map(),
}

export function getPeriodKey(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const week = getWeekNumber(date)
  return `${year}-${month}-W${week}`
}

function getWeekNumber(date: Date): number {
  const firstDay = new Date(date.getFullYear(), 0, 1)
  const pastDays = (date.getTime() - firstDay.getTime()) / 86400000
  return Math.ceil((pastDays + firstDay.getDay() + 1) / 7)
}

export function getContributionsForMember(memberId: string): ContributionRecord[] {
  return Array.from(store.contributions.values()).filter(c => c.memberId === memberId)
}

export function getActiveAuth(memberId: string): MemberAuth | undefined {
  const auth = store.auths.get(memberId)
  if (!auth || !auth.isActive) return undefined
  if (auth.revokedAt) return undefined
  if (new Date() > auth.expiresAt) return undefined
  return auth
}

export function getActiveMembers(circleId: string): Member[] {
  return Array.from(store.members.values()).filter(
    m => m.circleId === circleId && m.isActive
  )
}

export function hasContributedInPeriod(memberId: string, period: string): boolean {
  return Array.from(store.contributions.values()).some(
    c => c.memberId === memberId && c.period === period && c.status === 'completed'
  )
}
