import { Injectable, inject } from '@angular/core'
import { APP_CONTEXT } from '../tokens'

//#region AppService
@Injectable()
export class AppService {
	private context = inject(APP_CONTEXT)

	exit(error?: Error): void {
		this.context.exit(error)
	}
}
//#endregion AppService
