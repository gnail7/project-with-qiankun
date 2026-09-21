import Antd from 'ant-design-vue'
import { ConfigProvider, theme as antdTheme } from 'ant-design-vue'
import DefaultTheme from 'vitepress/theme'
import { defineComponent, h } from 'vue'
import { useData } from 'vitepress'
import 'ant-design-vue/dist/reset.css'
import './custom.css'

const DocsLayout = defineComponent({
  name: 'DocsLayout',
  setup() {
    const { isDark } = useData()

    return () =>
      h(
        ConfigProvider,
        {
          theme: {
            algorithm: isDark.value ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
          },
        },
        {
          default: () => h(DefaultTheme.Layout),
        },
      )
  },
})

export default {
  extends: DefaultTheme,
  Layout: DocsLayout,
  enhanceApp({ app }) {
    app.use(Antd)
  },
}
