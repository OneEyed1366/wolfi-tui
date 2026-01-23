import { Box } from '../Box'
import { Text } from '../Text'
import { useComponentTheme } from '../../theme/theme'
import { type IAlertProps, type IAlertTheme } from './types'

//#region Component
export function Alert({ children, variant, title }: IAlertProps) {
	const { styles, config } = useComponentTheme<IAlertTheme>('Alert')

	return (
		<Box {...styles.container({ variant })}>
			<Box {...styles.iconContainer()}>
				<Text {...styles.icon({ variant })}>{config({ variant }).icon}</Text>
			</Box>

			<Box {...styles.content()}>
				{title && <Text {...styles.title()}>{title}</Text>}
				<Text {...styles.message()}>{children}</Text>
			</Box>
		</Box>
	)
}
//#endregion Component
