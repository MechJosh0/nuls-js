module.exports = {
	transform: {
		'^.+\\.js?$': 'babel-jest',
		'^.+\\.tsx?$': 'ts-jest'
	},
	testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.(jsx?|tsx?)$',
	moduleNameMapper: {
		'^@/(.*)$': '<rootDir>/src/$1',
		'^__testConfigs/(.*)$': '<rootDir>/testConfigs/$1'
	},
	moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
	collectCoverageFrom: [
		'src/**/*.ts',
		'!**/node_modules/**',
		'!**/*.d.ts'
	],
	testPathIgnorePatterns: [
		'./node_modules/',
		'./dist/',
		'./testConfigs/jest-setup.ts'
	],
	reporters: ['default'],
	coverageDirectory: 'testConfigs/reports/coverage',
	coverageReporters: [
		'cobertura',
		'lcov'
	],
	bail: true,
	coverageThreshold: {
		global: {
			functions: 100,
			lines: 90,
			statements: 90
		}
	},
	setupFiles: [
		'./testConfigs/jest-setup.ts'
	],
	coveragePathIgnorePatterns: ['.*\\.d\\.ts', '<rootDir>/node_modules/']
};
