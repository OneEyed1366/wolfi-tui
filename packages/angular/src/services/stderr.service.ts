import { Injectable, inject } from '@angular/core'
import { STDERR_CONTEXT } from '../tokens'

//#region StderrService
@Injectable()
export class StderrService {
	private context = inject(STDERR_CONTEXT)

	get stderr(): NodeJS.WriteStream {
		return this.context.stderr
	}

	write(data: string): void {
		this.context.write(data)
	}
}
//#endregion StderrService
