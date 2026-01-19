import Box, {type Props as BoxProps} from '../Box.js';
import Text, {type Props as TextProps} from '../Text.js';
import {useComponentTheme, type ComponentTheme} from '../../theme/theme.js';
import {useSpinner, type UseSpinnerProps} from './use-spinner.js';

//#region Types
export type SpinnerProps = UseSpinnerProps & {
	/**
	 * Label to show near the spinner.
	 */
	readonly label?: string;
};

type SpinnerTheme = {
	styles: {
		container: () => Partial<BoxProps>;
		frame: () => Partial<TextProps>;
		label: () => Partial<TextProps>;
	};
};
//#endregion Types

//#region Theme
export const spinnerTheme = {
	styles: {
		container: (): Partial<BoxProps> => ({
			gap: 1,
		}),
		frame: (): Partial<TextProps> => ({
			color: 'blue',
		}),
		label: (): Partial<TextProps> => ({}),
	},
} satisfies ComponentTheme;
//#endregion Theme

//#region Component
export function Spinner({label, type}: SpinnerProps) {
	const {frame} = useSpinner({type});
	const {styles} = useComponentTheme<SpinnerTheme>('Spinner');

	return (
		<Box {...styles.container()}>
			<Text {...styles.frame()}>{frame}</Text>
			{label && <Text {...styles.label()}>{label}</Text>}
		</Box>
	);
}
//#endregion Component
