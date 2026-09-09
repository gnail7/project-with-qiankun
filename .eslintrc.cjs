// 传统 ESLint 配置（ESLint 8 + Prettier）
// plugin:prettier/recommended 放在最后：
//   1) 关闭与 Prettier 冲突的格式规则（eslint-config-prettier）
//   2) 用 Prettier 规则做格式化（eslint-plugin-prettier），`eslint --fix` 即自动格式化
module.exports = {
  root: true,
  env: {
    browser: true,
    es2022: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:vue/vue3-recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
  ],
  // vue-eslint-parser 解析 .vue，内部对 .ts/.js 用 @typescript-eslint/parser
  parser: 'vue-eslint-parser',
  parserOptions: {
    parser: '@typescript-eslint/parser',
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  rules: {
    'vue/multi-word-component-names': 'off', // 允许单单词组件名（如 login/index.vue）
    'vue/require-default-prop': 'off',
    '@typescript-eslint/no-explicit-any': 'off', // 项目现有代码使用了 any
    'no-console': [
      'error',
      {
        allow: ['error', 'warn'],
      },
    ],
    'no-debugger': 'error', // 不允许出现 debugger
  },
  overrides: [
    {
      // Nuxt 的 auto-import（ref/computed/useAsyncData/useRoute/useHead 等）由 Volar/TS 负责，
      // ESLint core 的 no-undef 感知不到这些全局，会在 .vue 里误报。
      // @typescript-eslint 只用 *.ts 的 glob 关了 no-undef，不覆盖 .vue，这里单独关掉。
      files: ['*.vue'],
      rules: {
        'no-undef': 'off',
      },
    },
  ],
  ignorePatterns: ['node_modules/', 'dist/', '.pnpm-store/', '.vite/', 'public/', 'coverage/'],
}
