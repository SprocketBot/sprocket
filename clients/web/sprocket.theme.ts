import type { CustomThemeConfig, ThemeConfig } from '@skeletonlabs/tw-plugin';

export const myCustomTheme: ThemeConfig & CustomThemeConfig = {
	name: 'my-custom-theme',
	properties: {
		// =~= Theme Properties =~=
		'--theme-font-family-base': `Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji'`,
		'--theme-font-family-heading': `Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji'`,
		'--theme-font-color-base': '0 0 0',
		'--theme-font-color-dark': '255 255 255',
		'--theme-rounded-base': '0px',
		'--theme-rounded-container': '0px',
		'--theme-border-base': '1px',
		// =~= Theme On-X Colors =~=
		'--on-primary': '0 0 0',
		'--on-secondary': 'var(--color-surface-900)',
		'--on-tertiary': '0 0 0',
		'--on-success': '0 0 0',
		'--on-warning': '0 0 0',
		'--on-error': '255 255 255',
		'--on-surface': '255 255 255',
		// =~= Theme Colors  =~=
		// primary | #FEBF2B
		'--color-primary-50': '255 245 223', // #fff5df
		'--color-primary-100': '255 242 213', // #fff2d5
		'--color-primary-200': '255 239 202', // #ffefca
		'--color-primary-300': '255 229 170', // #ffe5aa
		'--color-primary-400': '254 210 107', // #fed26b
		'--color-primary-500': '254 191 43', // #FEBF2B
		'--color-primary-600': '229 172 39', // #e5ac27
		'--color-primary-700': '191 143 32', // #bf8f20
		'--color-primary-800': '152 115 26', // #98731a
		'--color-primary-900': '124 94 21', // #7c5e15
		// secondary | #F15A24
		'--color-secondary-50': '253 230 222', // #fde6de
		'--color-secondary-100': '252 222 211', // #fcded3
		'--color-secondary-200': '252 214 200', // #fcd6c8
		'--color-secondary-300': '249 189 167', // #f9bda7
		'--color-secondary-400': '245 140 102', // #f58c66
		'--color-secondary-500': '241 90 36', // #F15A24
		'--color-secondary-600': '217 81 32', // #d95120
		'--color-secondary-700': '181 68 27', // #b5441b
		'--color-secondary-800': '145 54 22', // #913616
		'--color-secondary-900': '118 44 18', // #762c12
		// tertiary | #0097D7
		'--color-tertiary-50': '217 239 249', // #d9eff9
		'--color-tertiary-100': '204 234 247', // #cceaf7
		'--color-tertiary-200': '191 229 245', // #bfe5f5
		'--color-tertiary-300': '153 213 239', // #99d5ef
		'--color-tertiary-400': '77 182 227', // #4db6e3
		'--color-tertiary-500': '0 151 215', // #0097D7
		'--color-tertiary-600': '0 136 194', // #0088c2
		'--color-tertiary-700': '0 113 161', // #0071a1
		'--color-tertiary-800': '0 91 129', // #005b81
		'--color-tertiary-900': '0 74 105', // #004a69
		// success | #189666
		'--color-success-50': '220 239 232', // #dcefe8
		'--color-success-100': '209 234 224', // #d1eae0
		'--color-success-200': '197 229 217', // #c5e5d9
		'--color-success-300': '163 213 194', // #a3d5c2
		'--color-success-400': '93 182 148', // #5db694
		'--color-success-500': '24 150 102', // #189666
		'--color-success-600': '22 135 92', // #16875c
		'--color-success-700': '18 113 77', // #12714d
		'--color-success-800': '14 90 61', // #0e5a3d
		'--color-success-900': '12 74 50', // #0c4a32
		// warning | #d2cf6a
		'--color-warning-50': '248 248 233', // #f8f8e9
		'--color-warning-100': '246 245 225', // #f6f5e1
		'--color-warning-200': '244 243 218', // #f4f3da
		'--color-warning-300': '237 236 195', // #edecc3
		'--color-warning-400': '224 221 151', // #e0dd97
		'--color-warning-500': '210 207 106', // #d2cf6a
		'--color-warning-600': '189 186 95', // #bdba5f
		'--color-warning-700': '158 155 80', // #9e9b50
		'--color-warning-800': '126 124 64', // #7e7c40
		'--color-warning-900': '103 101 52', // #676534
		// error | #D81C0E
		'--color-error-50': '249 221 219', // #f9dddb
		'--color-error-100': '247 210 207', // #f7d2cf
		'--color-error-200': '245 198 195', // #f5c6c3
		'--color-error-300': '239 164 159', // #efa49f
		'--color-error-400': '228 96 86', // #e46056
		'--color-error-500': '216 28 14', // #D81C0E
		'--color-error-600': '194 25 13', // #c2190d
		'--color-error-700': '162 21 11', // #a2150b
		'--color-error-800': '130 17 8', // #821108
		'--color-error-900': '106 14 7', // #6a0e07
		// surface | #5e5e5e
		'--color-surface-50': '231 231 231', // #e7e7e7
		'--color-surface-100': '223 223 223', // #dfdfdf
		'--color-surface-200': '215 215 215', // #d7d7d7
		'--color-surface-300': '191 191 191', // #bfbfbf
		'--color-surface-400': '142 142 142', // #8e8e8e
		'--color-surface-500': '94 94 94', // #5e5e5e
		'--color-surface-600': '85 85 85', // #555555
		'--color-surface-700': '71 71 71', // #474747
		'--color-surface-800': '56 56 56', // #383838
		'--color-surface-900': '46 46 46' // #2e2e2e
	}
};
