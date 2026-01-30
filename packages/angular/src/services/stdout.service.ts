import { Injectable, inject } from '@angular/core'
import { STDOUT_CONTEXT } from '../tokens'

//#region StdoutService
@Injectable()
export class StdoutService {
	private context = inject(STDOUT_CONTEXT)

	get stdout(): NodeJS.WriteStream {
		return this.context.stdout
	}

	write(data: string): void {
		this.context.write(data)
	}
}
//#endregion StdoutService
