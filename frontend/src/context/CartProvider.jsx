/**
 * Cart state for the POS.
 *
 * Cart lines store `product_id` (server id), display `name`, `price`, `stock`, and `quantity`.
 * Totals recompute on every mutation so the UI always reflects line math.
 */

import { useCallback, useMemo, useReducer } from 'react'
import { CartContext } from './cartContext.js'

const ACTIONS = {
  ADD: 'ADD',
  REMOVE: 'REMOVE',
  SET_QTY: 'SET_QTY',
  CLEAR: 'CLEAR',
}

function totals(lines) {
  const subtotal = lines.reduce(
    (sum, line) => sum + Number(line.price) * line.quantity,
    0,
  )
  const itemCount = lines.reduce((sum, line) => sum + line.quantity, 0)
  return { subtotal, grandTotal: subtotal, itemCount }
}

function reducer(state, action) {
  switch (action.type) {
    case ACTIONS.ADD: {
      const p = action.payload
      const productId = p.id
      const existing = state.lines.find((l) => l.product_id === productId)
      let lines
      if (existing) {
        const nextQty = Math.min(existing.quantity + 1, p.stock)
        lines = state.lines.map((l) =>
          l.product_id === productId ? { ...l, quantity: nextQty } : l,
        )
      } else {
        lines = [
          ...state.lines,
          {
            product_id: productId,
            name: p.name,
            price: p.price,
            stock: p.stock,
            quantity: Math.min(1, p.stock),
          },
        ]
      }
      return { lines, ...totals(lines) }
    }
    case ACTIONS.REMOVE: {
      const productId = action.payload
      const lines = state.lines.filter((l) => l.product_id !== productId)
      return { lines, ...totals(lines) }
    }
    case ACTIONS.SET_QTY: {
      const { productId, quantity } = action.payload
      const raw = Number(quantity)
      if (!Number.isFinite(raw) || raw < 1) {
        return state
      }
      const lines = state.lines.map((l) => {
        if (l.product_id !== productId) return l
        const q = Math.min(Math.floor(raw), l.stock)
        return { ...l, quantity: Math.max(1, q) }
      })
      return { lines, ...totals(lines) }
    }
    case ACTIONS.CLEAR:
      return { lines: [], subtotal: 0, grandTotal: 0, itemCount: 0 }
    default:
      return state
  }
}

const initialState = { lines: [], subtotal: 0, grandTotal: 0, itemCount: 0 }

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState)

  const addProduct = useCallback((product) => {
    dispatch({ type: ACTIONS.ADD, payload: product })
  }, [])

  const removeLine = useCallback((productId) => {
    dispatch({ type: ACTIONS.REMOVE, payload: productId })
  }, [])

  const setQuantity = useCallback((productId, quantity) => {
    dispatch({ type: ACTIONS.SET_QTY, payload: { productId, quantity } })
  }, [])

  const clear = useCallback(() => {
    dispatch({ type: ACTIONS.CLEAR })
  }, [])

  const value = useMemo(
    () => ({
      lines: state.lines,
      subtotal: state.subtotal,
      grandTotal: state.grandTotal,
      itemCount: state.itemCount,
      addProduct,
      removeLine,
      setQuantity,
      clear,
    }),
    [
      state.lines,
      state.subtotal,
      state.grandTotal,
      state.itemCount,
      addProduct,
      removeLine,
      setQuantity,
      clear,
    ],
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}
