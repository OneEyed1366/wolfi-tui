import {type ReactNode, type Key, type LegacyRef} from 'react';
import {type Except} from 'type-fest';
import {type DOMElement, type Styles} from '@wolfie/core';

declare namespace Ink {
	type Box = {
		readonly internal_static?: boolean;
		readonly children?: ReactNode;
		readonly key?: Key;
		readonly ref?: LegacyRef<DOMElement>;
		readonly style?: Except<Styles, 'textWrap'>;
		readonly internal_accessibility?: DOMElement['internal_accessibility'];
	};

	type Text = {
		readonly children?: ReactNode;
		readonly key?: Key;
		readonly style?: Styles;
		readonly internal_transform?: (children: string, index: number) => string;
		readonly internal_accessibility?: DOMElement['internal_accessibility'];
	};
}
