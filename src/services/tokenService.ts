export type CustomerTier = 'ANONYMOUS' | 'REGISTERED' | 'PRO'

export interface UserSession {
  email: string
  name: string
  registeredAt: string
  tier: CustomerTier
}

export interface TokenState {
  date: string // YYYY-MM-DD
  usedTokens: number
  maxTokens: number
  remainingTokens: number
  tier: CustomerTier
  user: UserSession | null
}

const STORAGE_KEY_TOKEN = 'mechmate_token_state_v1'
const STORAGE_KEY_USER = 'mechmate_user_session_v1'

const TIER_LIMITS: Record<CustomerTier, number> = {
  ANONYMOUS: 5,
  REGISTERED: 25,
  PRO: 100
}

const memoryStore: Record<string, string> = {}

function getStorage() {
  if (typeof window !== 'undefined' && window.localStorage) {
    return window.localStorage
  }
  return {
    getItem: (key: string): string | null => memoryStore[key] ?? null,
    setItem: (key: string, val: string): void => { memoryStore[key] = val },
    removeItem: (key: string): void => { delete memoryStore[key] },
    clear: (): void => {
      for (const k of Object.keys(memoryStore)) {
        delete memoryStore[k]
      }
    }
  }
}

function getTodayKey(): string {
  return new Date().toISOString().split('T')[0]
}

export function getUserSession(): UserSession | null {
  try {
    const raw = getStorage().getItem(STORAGE_KEY_USER)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function getTokenUsage(): TokenState {
  const user = getUserSession()
  const tier: CustomerTier = user ? user.tier : 'ANONYMOUS'
  const maxTokens = TIER_LIMITS[tier]
  const today = getTodayKey()

  try {
    const raw = getStorage().getItem(STORAGE_KEY_TOKEN)
    if (raw) {
      const parsed = JSON.parse(raw)
      // If same day, return recorded usage with current tier limits
      if (parsed.date === today) {
        const used = Math.min(parsed.usedTokens || 0, maxTokens)
        return {
          date: today,
          usedTokens: used,
          maxTokens,
          remainingTokens: Math.max(0, maxTokens - used),
          tier,
          user
        }
      }
    }
  } catch {
    // fallback to clean state
  }

  // New day or first time: initialize with 0 used
  const newState: TokenState = {
    date: today,
    usedTokens: 0,
    maxTokens,
    remainingTokens: maxTokens,
    tier,
    user
  }
  saveTokenUsage(newState)
  return newState
}

function saveTokenUsage(state: TokenState): void {
  try {
    getStorage().setItem(STORAGE_KEY_TOKEN, JSON.stringify({
      date: state.date,
      usedTokens: state.usedTokens
    }))
  } catch (err) {
    console.warn('Could not persist token state:', err)
  }
}

export function canConsumeToken(amount = 1): boolean {
  const state = getTokenUsage()
  return state.remainingTokens >= amount
}

export function consumeToken(amount = 1): { success: boolean; state: TokenState } {
  const state = getTokenUsage()
  if (state.remainingTokens < amount) {
    return { success: false, state }
  }

  const updated: TokenState = {
    ...state,
    usedTokens: state.usedTokens + amount,
    remainingTokens: state.remainingTokens - amount
  }

  saveTokenUsage(updated)
  return { success: true, state: updated }
}

export function signInCustomer(email: string, name?: string): { success: boolean; state: TokenState } {
  const cleanEmail = email.trim().toLowerCase()
  if (!cleanEmail || !cleanEmail.includes('@')) {
    return { success: false, state: getTokenUsage() }
  }

  const cleanName = name?.trim() || cleanEmail.split('@')[0]
  const user: UserSession = {
    email: cleanEmail,
    name: cleanName.charAt(0).toUpperCase() + cleanName.slice(1),
    registeredAt: new Date().toISOString(),
    tier: 'REGISTERED'
  }

  try {
    getStorage().setItem(STORAGE_KEY_USER, JSON.stringify(user))
  } catch (err) {
    console.warn('Could not save user session:', err)
  }

  // Recalculate token state with new tier (25 tokens)
  const currentUsage = getTokenUsage()
  const updated: TokenState = {
    ...currentUsage,
    tier: 'REGISTERED',
    maxTokens: TIER_LIMITS.REGISTERED,
    remainingTokens: Math.max(0, TIER_LIMITS.REGISTERED - currentUsage.usedTokens),
    user
  }

  saveTokenUsage(updated)
  return { success: true, state: updated }
}

export function signOutCustomer(): TokenState {
  try {
    getStorage().removeItem(STORAGE_KEY_USER)
  } catch (err) {
    console.warn('Could not clear user session:', err)
  }

  const today = getTodayKey()
  const state: TokenState = {
    date: today,
    usedTokens: 0,
    maxTokens: TIER_LIMITS.ANONYMOUS,
    remainingTokens: TIER_LIMITS.ANONYMOUS,
    tier: 'ANONYMOUS',
    user: null
  }
  saveTokenUsage(state)
  return state
}

export function resetTokenQuotaForTesting(): void {
  try {
    getStorage().removeItem(STORAGE_KEY_TOKEN)
    getStorage().removeItem(STORAGE_KEY_USER)
  } catch {}
}
