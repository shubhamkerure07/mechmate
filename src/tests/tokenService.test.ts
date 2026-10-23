import { describe, it, expect, beforeEach } from 'vitest'
import {
  getTokenUsage,
  consumeToken,
  canConsumeToken,
  signInCustomer,
  signOutCustomer,
  resetTokenQuotaForTesting
} from '../services/tokenService'

describe('Token Service & Customer Sign-in Policy', () => {
  beforeEach(() => {
    resetTokenQuotaForTesting()
  })

  it('initializes anonymous user with 5 daily tokens', () => {
    const state = getTokenUsage()
    expect(state.tier).toBe('ANONYMOUS')
    expect(state.maxTokens).toBe(5)
    expect(state.remainingTokens).toBe(5)
    expect(state.usedTokens).toBe(0)
    expect(state.user).toBeNull()
  })

  it('consumes tokens correctly until daily limit is reached', () => {
    expect(canConsumeToken(1)).toBe(true)

    for (let i = 0; i < 5; i++) {
      const res = consumeToken(1)
      expect(res.success).toBe(true)
    }

    const state = getTokenUsage()
    expect(state.usedTokens).toBe(5)
    expect(state.remainingTokens).toBe(0)
    expect(canConsumeToken(1)).toBe(false)

    // Cannot consume when exhausted
    const over = consumeToken(1)
    expect(over.success).toBe(false)
  })

  it('signing in upgrades customer to REGISTERED tier with 25 tokens/day', () => {
    // Consume 3 anonymous tokens
    consumeToken(3)

    const signRes = signInCustomer('driver@example.com', 'Alex Driver')
    expect(signRes.success).toBe(true)
    expect(signRes.state.tier).toBe('REGISTERED')
    expect(signRes.state.maxTokens).toBe(25)
    expect(signRes.state.usedTokens).toBe(3)
    expect(signRes.state.remainingTokens).toBe(22)
    expect(signRes.state.user?.email).toBe('driver@example.com')
    expect(signRes.state.user?.name).toBe('Alex Driver')
  })

  it('rejects invalid email formats during sign-in', () => {
    const invalid = signInCustomer('notanemail')
    expect(invalid.success).toBe(false)
    expect(invalid.state.tier).toBe('ANONYMOUS')
  })

  it('signing out reverts customer to ANONYMOUS tier', () => {
    signInCustomer('driver@example.com')
    const outState = signOutCustomer()
    expect(outState.tier).toBe('ANONYMOUS')
    expect(outState.maxTokens).toBe(5)
    expect(outState.user).toBeNull()
  })
})
