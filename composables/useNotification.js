import { reactive } from 'vue'

const state = reactive({
    toasts: []
})

let idCounter = 0

export function useNotification() {
    function show(message, type = 'info', duration = 2000, closable = false) {
        const id = idCounter++
        state.toasts.push({
            id,
            message,
            type,
            duration,
            closable
        })

        if (duration > 0) {
            setTimeout(() => remove(id), duration)
        }
    }

    function remove(id) {
        const index = state.toasts.findIndex(t => t.id === id)
        if (index !== -1) state.toasts.splice(index, 1)
    }

    return { state, show, remove }
}