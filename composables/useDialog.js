import { reactive } from 'vue'

const state = reactive({
    visible: false,
    title: '',
    content: '',
    html: false,
    closable: true,
    showClose: false,
    buttons: []
})

function show(options = {}) {
    state.title = options.title ?? ''
    state.content = options.content ?? ''
    state.html = options.html ?? false
    state.closable = options.closable ?? true
    state.showClose = options.showClose ?? false
    state.buttons = (options.buttons ?? []).map(btn => ({
        text: btn.text ?? '确定',
        type: btn.type ?? 'default',
        close: btn.close ?? true,
        onClick: btn.onClick ?? null
    }))
    state.visible = true
}

function hide() {
    state.visible = false
}

function confirm(options = {}) {
    return new Promise(resolve => {
        show({
            ...options,
            buttons: [
                {
                    text: options.cancelText ?? '取消',
                    type: 'default',
                    onClick: () => resolve(false)
                },
                {
                    text: options.okText ?? '确定',
                    type: 'primary',
                    onClick: () => resolve(true)
                }
            ]
        })
    })
}

export function useDialog() {
    return { state, show, hide, confirm }
}
