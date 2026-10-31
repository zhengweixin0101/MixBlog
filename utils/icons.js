// 全站图标唯一来源：lucide 提供 IconNode 数据（24×24 网格）
// 由 components/AppIcon 经 morphicons/vue 渲染，props 变更自动播放形变动画
// 拿不到 Vue 组件的 HTML 字符串注入场景（useShareDialog 的分享按钮、正文代码块复制按钮）走 iconSvgMarkup 输出与 AppIcon 同源的稳态 SVG
import {
  Mail, Rss, House, PenLine, Music, Link, MessagesSquare, User,
  Menu, X, Sun, Moon,
  RotateCw,
  Shuffle, Play, Pause, Copy, Contrast, ExternalLink, ClipboardPaste, Scissors, Search,
  MessageSquareQuote, MessageSquareText, SkipBack, SkipForward, ListMusic, Maximize, Minimize, Check,
  Repeat, Repeat1, Volume2, VolumeX,
  Clock, MapPin, Eye, Flame, Calendar, History, HandCoins, QrCode, Share2, Download,
  CircleArrowRight, LetterText, CircleHelp,
} from 'lucide'

const ARROW_LONG_LEFT = [['path', { d: 'M22 12H2' }], ['path', { d: 'M9 19 2 12l7-7' }]]
const ARROW_LONG_RIGHT = [['path', { d: 'M2 12h20' }], ['path', { d: 'M15 19 22 12l-7-7' }]]
const ARROW_LONG_UP = [['path', { d: 'M12 22V2' }], ['path', { d: 'M19 9 12 2 5 9' }]]

const GITHUB_MARK = [[
  'path',
  {
    d: 'M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12',
    fill: 'currentColor',
    stroke: 'none',
  },
]]

const DICE_D_ICONFONT = [[
  'path',
  {
    d: 'M10.85 18.98 L5.74 10.08 L0.8 17.39 Q0.7 17.55 0.8 17.74 Q0.89 17.93 1.08 17.95 L1.08 17.95 L10.85 18.98 M1.1 14.79 L1.1 14.79 L4.62 9.04 L1.03 6.89 Q0.94 6.84 0.84 6.89 Q0.75 6.94 0.75 7.05 L0.75 7.05 L0.75 14.69 Q0.75 14.83 0.89 14.87 Q1.03 14.9 1.1 14.79 M1.59 19.85 L1.59 19.85 L10.71 23.97 Q10.9 24.04 11.07 23.94 Q11.25 23.83 11.25 23.62 L11.25 23.62 L11.25 20.55 L1.71 19.5 Q1.55 19.47 1.5 19.63 Q1.45 19.78 1.59 19.85 M1.59 5.48 L5.41 7.78 L9.16 1.08 Q9.26 0.91 9.2 0.75 Q9.14 0.58 8.98 0.52 Q8.81 0.47 8.65 0.54 L8.65 0.54 L1.59 5.18 Q1.5 5.22 1.5 5.33 Q1.5 5.44 1.59 5.48 L1.59 5.48 M6.89 8.25 L12 8.25 L17.11 8.25 L12.63 0.35 Q12.42 0 12 0 Q11.58 0 11.37 0.35 L11.37 0.35 L6.89 8.25 M22.97 6.89 L22.97 6.89 L19.38 9.04 L22.9 14.79 Q22.97 14.9 23.11 14.87 Q23.25 14.83 23.25 14.69 L23.25 14.69 L23.25 7.05 Q23.25 6.94 23.16 6.89 Q23.06 6.84 22.97 6.89 M14.84 1.08 L18.59 7.78 L22.41 5.48 Q22.5 5.44 22.5 5.33 Q22.5 5.22 22.41 5.18 L22.41 5.18 L15.35 0.54 Q15.19 0.47 15.02 0.52 Q14.86 0.58 14.8 0.75 Q14.74 0.91 14.84 1.08 L14.84 1.08 M22.29 19.5 L22.29 19.5 L12.75 20.55 L12.75 23.62 Q12.75 23.83 12.93 23.94 Q13.1 24.04 13.29 23.95 L13.29 23.95 L22.38 19.85 Q22.55 19.78 22.5 19.63 Q22.45 19.47 22.29 19.5 M23.2 17.39 L18.23 10.08 L13.15 18.98 L22.92 17.95 Q23.11 17.93 23.2 17.74 Q23.3 17.55 23.2 17.39 L23.2 17.39 M16.71 9.75 L12 9.75 L7.29 9.75 L12 17.97 L16.71 9.75',
    fill: 'currentColor',
    stroke: 'none',
  },
]]

// 音乐页面控制按钮改为实心图标，右键菜单仍为描边图标
const solidify = (icon) => icon.map(([tag, attrs]) =>
  (tag === 'rect' || (tag === 'path' && /z\s*$/i.test(attrs.d ?? '')))
    ? [tag, { ...attrs, fill: 'currentColor' }]
    : [tag, attrs]
)
const PLAY_SOLID = solidify(Play)
const PAUSE_SOLID = solidify(Pause)
const SKIP_BACK_TRI = solidify(SkipBack)[0];
const SKIP_FORWARD_TRI = solidify(SkipForward)[1];
const SKIP_BAR_W = 2;
const SKIP_BACK_SOLID = [
  ['rect', { x: 2, y: 4, width: SKIP_BAR_W, height: 16, rx: 1, fill: 'currentColor' }],
  SKIP_BACK_TRI,
]
const SKIP_FORWARD_SOLID = [
  ['rect', { x: 20, y: 4, width: SKIP_BAR_W, height: 16, rx: 1, fill: 'currentColor' }],
  SKIP_FORWARD_TRI,
]

const icons = {
  mail: Mail,
  github: GITHUB_MARK,
  rss: Rss,

  home: House,
  pen: PenLine,
  music: Music,
  link: Link,
  talks: MessagesSquare,
  about: User,

  menu: Menu,
  close: X,
  sun: Sun,
  moon: Moon,

  'arrow-left': ARROW_LONG_LEFT,
  'arrow-right': ARROW_LONG_RIGHT,
  'arrow-up': ARROW_LONG_UP,
  refresh: RotateCw,

  shuffle: Shuffle,
  play: Play,
  pause: Pause,
  'play-solid': PLAY_SOLID,
  'pause-solid': PAUSE_SOLID,
  copy: Copy,
  check: Check,
  contrast: Contrast,
  external: ExternalLink,
  paste: ClipboardPaste,
  cut: Scissors,
  search: Search,
  quote: MessageSquareQuote,
  comment: MessageSquareText,

  'skip-back': SkipBack,
  'skip-forward': SkipForward,
  'skip-back-solid': SKIP_BACK_SOLID,
  'skip-forward-solid': SKIP_FORWARD_SOLID,
  'list-music': ListMusic,
  maximize: Maximize,
  minimize: Minimize,

  repeat: Repeat,
  'repeat-1': Repeat1,
  volume: Volume2,
  'volume-mute': VolumeX,

  clock: Clock,
  'map-pin': MapPin,
  eye: Eye,
  flame: Flame,
  calendar: Calendar,
  history: History,
  donate: HandCoins,
  'qr-code': QrCode,
  share: Share2,
  download: Download,
  dice: DICE_D_ICONFONT,
  'circle-arrow-right': CircleArrowRight,
  words: LetterText,
}

export function getIcon(name) {
  const icon = icons[name]
  if (!icon) {
    if (import.meta.client && import.meta.dev) console.warn(`[icons] 未注册的图标名：${name}`)
    return CircleHelp
  }
  return icon
}

function nodeMarkup([tag, attrs]) {
  const rest = Object.entries(attrs).map(([k, v]) => ` ${k}="${v}"`).join('')
  return `<${tag}${rest}/>`
}

export function iconSvgMarkup(name, strokeWidth = 2) {
  const nodes = icons[name] || CircleHelp
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="1em" height="1em" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round">${nodes.map(nodeMarkup).join('')}</svg>`
}
