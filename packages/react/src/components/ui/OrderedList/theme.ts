import type {Props as BoxProps} from '../../Box.js';
import type {Props as TextProps} from '../../Text.js';
import type {ComponentTheme} from '../../../theme/theme.js';

//#region Types
export type OrderedListTheme = {
	styles: {
		list: () => Partial<BoxProps>;
		listItem: () => Partial<BoxProps>;
		marker: () => Partial<TextProps>;
		content: () => Partial<BoxProps>;
	};
};
//#endregion Types

//#region Theme
export const orderedListTheme = {
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
} satisfies ComponentTheme;
//#endregion Theme
