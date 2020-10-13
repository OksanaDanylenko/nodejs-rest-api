module.exports = {
  extends: ['eslint:recommended', 'prettier'],
  plugins: ['prettier'],
  env: {
    browser: true,
    commonjs: true,
    es2020: true,
  },
  parserOptions: {
    ecmaVersion: 11,
  },
  rules: {
    'prettier/prettier': [
      'error',
      {
        singleQuote: true,
        trailingComma: 'all',
        tabWidth: 2,
        jsxBracketSameLine: false,
      },
    ],
    semi: 2,
  },
};
