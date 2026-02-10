//#region Types
export type ITheme = {
	components: Record<string, IComponentTheme>
}

export type IComponentTheme = {
	styles?: Record<string, (props?: any) => IComponentStyles>
	config?: (props?: any) => Record<string, unknown>
}

export type IComponentStyles = Record<string, unknown>
//#endregion Types
