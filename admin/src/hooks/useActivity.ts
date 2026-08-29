import { useCallback, useState } from 'react'
import { adminApi, type AdminActivityResponse } from '../api/adminApi'
import { getApiErrorMessage } from '../lib/adminHelpers'

export const useActivity = (handleUnauthorizedError: (caught: Error) => boolean) => {
  const [activityResponse, setActivityResponse] = useState<AdminActivityResponse | null>(null)
  const [activityError, setActivityError] = useState<string | null>(null)
  const [activityLoadedAt, setActivityLoadedAt] = useState<string | null>(null)
  const [loadingActivity, setLoadingActivity] = useState(false)

  const resetActivity = useCallback(() => {
    setActivityResponse(null)
    setActivityError(null)
    setActivityLoadedAt(null)
  }, [])

  const loadActivity = useCallback(async () => {
    setLoadingActivity(true)
    setActivityError(null)
    try {
      const response = await adminApi.getActivity()
      setActivityResponse(response)
      setActivityLoadedAt(new Date().toLocaleString())
    } catch (caught) {
      if (!handleUnauthorizedError(caught instanceof Error ? caught : new Error(String(caught)))) setActivityError(getApiErrorMessage(caught instanceof Error ? caught : new Error(String(caught))))
    } finally {
      setLoadingActivity(false)
    }
  }, [handleUnauthorizedError])

  return {
    activity: activityResponse?.commits ?? [],
    activityError,
    activityLoadedAt,
    loadingActivity,
    loadActivity,
    resetActivity,
  }
}
