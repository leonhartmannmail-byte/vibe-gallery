import { useState, useEffect, useCallback } from 'react'
import { useAuth } from './useAuth'
import { sbQuery } from '../lib/supabase'

const ADMIN_EMAIL = 'cleckoneck@gmail.com'

export function useAdmin() {
  const { user, profile, loading: authLoading } = useAuth()
  const isAdmin = !authLoading && profile?.role === 'admin'

  // Generic CRUD helpers
  const fetchTable = useCallback(async (table, params = '') => {
    return sbQuery(table, { params: `?${params}` })
  }, [])

  const insertRow = useCallback(async (table, body) => {
    return sbQuery(table, { method: 'POST', body })
  }, [])

  const updateRow = useCallback(async (table, id, body) => {
    return sbQuery(table, { method: 'PATCH', params: `?id=eq.${id}`, body })
  }, [])

  const deleteRow = useCallback(async (table, id) => {
    return sbQuery(table, { method: 'DELETE', params: `?id=eq.${id}` })
  }, [])

  return { user, profile, isAdmin, authLoading, fetchTable, insertRow, updateRow, deleteRow }
}

export default useAdmin
