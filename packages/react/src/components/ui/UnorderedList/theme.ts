import figures from 'figures';
import type {Props as BoxProps} from '../../Box.js';
import type {Props as TextProps} from '../../Text.js';
import type {ComponentTheme} from '../../../theme/theme.js';

//#region Types
export type UnorderedListTheme = {
	styles: {
		list: () => Partial<BoxProps>;
		listItem: () => Partial<BoxProps>;
		marker: () => Partial<TextProps>;
		content: () => Partial<BoxProps>;
	};
	config: () => {
		marker: string | string[];
	};
};
//#endregion Types

//#region Theme
export const unorderedListTheme = {
	styles: {
		list: (): Partial<BoxProps> => ({
			flexDirection: 'column',
		}),
		listItem: (): Partial<BoxProps> => ({
			flexDirection: 'row',
		}),
		marker: (): Partial<TextProps> => ({
			color: 'green',
		}),
		content: (): Partial<BoxProps> => ({
			flexDirection: 'column',
			marginLeft: 1,
		}),
	},
	config() {
		return {
			marker: [figures.bullet, figures.line, figures.pointer],
		};
	},
} satisfies ComponentTheme;
//#endregion Theme
