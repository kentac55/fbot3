module.exports = {
  'extends': [
    'plugin:@typescript-eslint/recommended',
    'prettier',
    'prettier/@typescript-eslint',
  ],
  'plugins': [
    'prettier',
    '@typescript-eslint',
  ],
  'parser': '@typescript-eslint/parser',
  'parserOptions': {
    'ecmaVersion': 2018,
    'sourceType': 'module',
    'project': './tsconfig.json',
  },
  'env': {
    'es6': true,
    'node': true,
  },
  'rules': {
    'prettier/prettier': [
      'error',
      {
        'singleQuote': true,
        'trailingComma': 'es5',
        'semi': false,
      },
    ],
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/camelcase': 0, // slack-sdkがポンコツ
  },
}
