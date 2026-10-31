import { defineConfig } from 'unocss'

export default defineConfig({
    theme: {
        // 语义色指向 tokens.css 的变量，明暗两套自动跟随，模板里不必再写 dark
        colors: {
            bg: 'var(--bg)',
            surface: {
                DEFAULT: 'var(--surface)',
                2: 'var(--surface-2)',
                3: 'var(--surface-3)',
                4: 'var(--surface-4)',
            },
            overlay: 'var(--overlay)',
            line: {
                DEFAULT: 'var(--line)',
                strong: 'var(--line-strong)',
                // 输入框 hover
                field: 'var(--line-field)',
                soft: 'var(--ring-soft)',
            },
            ink: {
                DEFAULT: 'var(--ink)',
                strong: 'var(--ink-strong)',
                muted: 'var(--ink-muted)',
                subtle: 'var(--ink-subtle)',
            },
            accent: {
                DEFAULT: 'var(--accent)',
                2: 'var(--accent-2)',
                text: 'var(--accent-text)',
                strong: 'var(--accent-strong)',
                // 主题圆钮 hover 专用：不分主题的单值，明暗两套图标颜色一致
                'hover-fixed': 'var(--accent-hover-fixed)',
                soft: 'var(--accent-soft)',
                line: 'var(--accent-line)',
                'line-soft': 'var(--accent-line-soft)',
            },
            danger: 'var(--danger)',
            success: 'var(--success)',
            warning: 'var(--warning)',
            // 状态色的「面」版本，给 Toast 这类浮层当背景配浅色文字
            'danger-surface': 'var(--danger-surface)',
            'success-surface': 'var(--success-surface)',
            'warning-surface': 'var(--warning-surface)',
            'on-status': 'var(--on-status)',
            // 播放/进度条填充带（胶囊、Toast）；深色单独提亮，见 tokens.css
            'progress-fill': 'var(--progress-fill)',
            // 代码块上的按钮面，明暗各取一档，见 tokens.css
            'code-chip': 'var(--code-chip)',
        },
        // 与 tokens.css 的 --text-* 保持同名同值
        fontSize: {
            '2xs': '0.75rem',
            xs: '0.8125rem',
            sm: '0.875rem',
            base: '1rem',
            lg: 'clamp(1.0625rem, 1rem + 0.28vw, 1.125rem)',
            xl: 'clamp(1.1875rem, 1.12rem + 0.36vw, 1.3125rem)',
            '2xl': 'clamp(1.375rem, 1.25rem + 0.6vw, 1.625rem)',
            '3xl': 'clamp(1.625rem, 1.4rem + 1vw, 2.125rem)',
            '4xl': 'clamp(2rem, 1.6rem + 1.8vw, 3rem)',
        },
        borderRadius: {
            xs: '4px',
            sm: '7px',
            md: '10px',
            lg: '14px',
            xl: '18px',
            '2xl': '26px',
        },
        boxShadow: {
            xs: 'var(--shadow-xs)',
            sm: 'var(--shadow-sm)',
            md: 'var(--shadow-md)',
            lg: 'var(--shadow-lg)',
            none: 'none',
        },
        fontFamily: {
            display: 'var(--font-display)',
            sans: 'var(--font-sans)',
            mono: 'var(--font-mono)',
        },
        transitionDuration: {
            fast: '130ms',
            base: '220ms',
            slow: '380ms',
        },
        transitionTimingFunction: {
            out: 'var(--ease-out)',
            'in-out': 'var(--ease-in-out)',
            spring: 'var(--ease-spring)',
        },
    },
    shortcuts: [
        {
            'text-gradient': 'text-gradient',
            // 右键菜单项
            'rightMenu-item-1': 'text-lg text-ink-muted cursor-pointer p-1 px-2 rounded-md hover:text-accent-text transition-colors duration-fast',
            'rightMenu-item-2': 'cursor-pointer pl-2 p-1.5 text-ink hover:bg-accent-soft hover:text-accent-text rounded-md transition-colors duration-fast',
        },
    ],
    rules: [
        // preset 的 duration-* 只吃数字，主题键不产出 CSS；靠静态规则才真正走到 token
        [/^duration-(fast|base|slow)$/, ([, k]) => ({ 'transition-duration': `var(--dur-${k})` })],
        // bg-surface 必须走 background-image：--surface 是半透明的，用 background-color 时 blur 抓不到底层渐变
        [/^bg-surface$/, () => ({
            'background-image': 'linear-gradient(var(--surface), var(--surface))',
            '-webkit-backdrop-filter': 'blur(var(--surface-blur))',
            'backdrop-filter': 'blur(var(--surface-blur))',
        })],
        [/^bg-overlay$/, () => ({
            'background-image': 'linear-gradient(var(--overlay), var(--overlay))',
            '-webkit-backdrop-filter': 'blur(var(--overlay-blur))',
            'backdrop-filter': 'blur(var(--overlay-blur))',
        })],
        // 同 --overlay 的面，但不带 backdrop-filter：相邻的两个模糊面会互相采到对方边缘
        [/^bg-overlay-flat$/, () => ({
            'background-image': 'linear-gradient(var(--overlay), var(--overlay))',
        })],
        [/^bg-accent-soft$/, () => ({ 'background-image': 'linear-gradient(var(--accent-soft), var(--accent-soft))' })],
        ['text-gradient', {
            'background-image': 'var(--accent-gradient)',
            '-webkit-background-clip': 'text',
            'background-clip': 'text',
            '-webkit-text-fill-color': 'transparent',
            'color': 'transparent',
        }],
        // 荧光笔底的圆角，全站统一走 --radius-marker
        ['hl-base', {
            'border-radius': 'var(--radius-marker)',
        }],
        // 卡片圆角
        ['rounded-card', {
            'border-radius': 'var(--radius-card)',
        }],
        // 卡片：圆角 + 半透面 + 奶油扩散阴影 + 顶部高光内影
        ['card-base', {
            'border-radius': 'var(--radius-card)',
            'border': '1px solid var(--line)',
            'box-shadow': 'var(--shadow-lg), var(--sheen)',
        }],
        // 输入框底
        ['field-base', {
            'background-image': 'var(--sunken)',
        }],
        // 输入框聚焦柔光
        ['field-ring', {
            'box-shadow': 'var(--ring-field)',
        }],
        // 导航指示器
        ['neu-indicator', {
            'background-image': 'var(--indicator-surface)',
            'box-shadow': 'var(--indicator-shadow)',
        }],
    ],
})