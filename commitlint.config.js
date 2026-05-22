export default {
  extends: ['@commitlint/config-conventional'],
  parserPreset: {
    parserOpts: {
      issuePrefixes: ['JIRA-'],
    },
  },
  rules: {
    'type-empty': [2, 'never'],
    'subject-empty': [2, 'never'],
    // Scope is optional — any value or omitted is accepted
    'scope-empty': [0],
    'footer-leading-blank': [2, 'always'],
    'references-empty': [0, 'never'],
    'type-enum': [2, 'always', ['feat', 'fix', 'docs', 'style', 'refactor', 'test', 'chore']],
    // Fail if the full commit header is shorter than 10 characters
    'header-min-length': [2, 'always', 10],
    // Warn if the full commit header exceeds 100 characters
    'header-max-length': [1, 'always', 100],
  },
};
