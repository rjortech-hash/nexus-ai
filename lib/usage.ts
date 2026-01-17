import { PLANS } from "./plans"

export async function checkUsageLimit(userId: string, plan: keyof typeof PLANS): Promise<{
  allowed: boolean
  remaining: number
  limit: number | null
  message?: string
}> {
  const planDetails = PLANS[plan]

  // If plan has no limit (null), user can proceed
  if (planDetails.dailyLimit === null) {
    return {
      allowed: true,
      remaining: -1, // -1 means unlimited
      limit: null
    }
  }

  // TODO: Implement actual usage tracking with database
  // For now, returning mock data
  const dailyUsage = 0 // Would fetch from database
  const remaining = planDetails.dailyLimit - dailyUsage

  if (remaining <= 0) {
    return {
      allowed: false,
      remaining: 0,
      limit: planDetails.dailyLimit,
      message: `You've reached your daily limit of ${planDetails.dailyLimit} conversations. Upgrade to Pro for unlimited access!`
    }
  }

  return {
    allowed: true,
    remaining,
    limit: planDetails.dailyLimit
  }
}

export async function incrementUsage(userId: string): Promise<void> {
  // TODO: Implement actual usage increment with database
  // This would:
  // 1. Find or create a usage record for today
  // 2. Increment the count
  // 3. Store in database
  console.log(`Incrementing usage for user: ${userId}`)
}

export async function getDailyUsage(userId: string): Promise<number> {
  // TODO: Implement actual usage fetch from database
  // This would query the database for today's usage count
  return 0 // Mock data
}

export async function getUserPlan(userId: string): Promise<keyof typeof PLANS> {
  // TODO: Implement actual plan fetching from database
  // This would query the user's subscription status
  return "FREE" // Mock data - default to FREE plan
}
