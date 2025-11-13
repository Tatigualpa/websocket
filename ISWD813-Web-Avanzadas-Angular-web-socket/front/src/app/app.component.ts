import { Component } from '@angular/core'

@Component({
	selector: 'app-root',
	template: `
		<div class="h-screen bg-gray-50">
			<app-ws-demo></app-ws-demo>
		</div>
	`,
})
export class AppComponent {
	title = 'WebSocket Demo'
}
