import { platformBrowserDynamic } from '@angular/platform-browser-dynamic'
import { AppModule } from './app/app.module'

console.log('Starting Angular app...')

platformBrowserDynamic()
	.bootstrapModule(AppModule)
	.then((ref) => {
		console.log('Angular app started successfully')
	})
	.catch((err) => {
		console.error('Error starting app:', err)
		console.error('Error details:', err.message, err.stack)
	})
