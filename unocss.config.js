import { defineConfig } from 'unocss'

export default defineConfig({
    shortcuts: [
        {
            'text-gradient': 'bg-gradient-to-r from-#00e699 to-#00e2d8 bg-clip-text text-transparent webkit-text',
            'rightMenu-item-1': 'text-lg text-#2f3f5b/80 dark:text-white dark:hover:text-gray-700 cursor-pointer p-1 px-2 hover:bg-#00e699/50 dark:hover:bg-#00e699 rounded-lg transition-colors duration-130',
            'rightMenu-item-2': 'cursor-pointer pl-2 p-1.5 text-#2f3f5b/90 dark:text-white dark:hover:text-gray-700 hover:bg-#00e699/50 dark:hover:bg-#00e699 rounded-lg transition-colors duration-130'
        }
    ],
    rules: [
        ['webkit-text', {
            '-webkit-background-clip': 'text',
            '-webkit-text-fill-color': 'transparent',
        }]
    ]
})
