import nextVitals from 'eslint-config-next/core-web-vitals';

const eslintConfig = [
  {
    ignores: ['dist/**'],
  },
  ...nextVitals,
];

export default eslintConfig;
