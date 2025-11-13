// src/app/services/websocket.service.ts
import { Injectable, OnDestroy } from '@angular/core'
import { webSocket, WebSocketSubject } from 'rxjs/webSocket'
import { Observable, Subject, timer, Subscription } from 'rxjs'
import { retryWhen, delayWhen, tap } from 'rxjs/operators'

export interface WSMessage {
	type?: string
	messageType?: string
	payload?: any
}

@Injectable({
	providedIn: 'root',
})
export class WebsocketService implements OnDestroy {
	private WS_URL = 'ws://localhost:8080'
	private socket$?: WebSocketSubject<WSMessage>
	private connectionStatus$ = new Subject<boolean>()
	private incoming$ = new Subject<WSMessage>()
	private reconnectInterval = 3000
	private manualClose = false
	private sub?: Subscription

	public messages$(): Observable<WSMessage> {
		return this.incoming$.asObservable()
	}

	public status$(): Observable<boolean> {
		return this.connectionStatus$.asObservable()
	}

	constructor() {
		this.connect()
	}

	private connect() {
  if (this.socket$ && !this.socket$.closed) {
    // Ya hay una conexión activa
    return
  }

  this.manualClose = false
  this.socket$ = webSocket<WSMessage>({
    url: this.WS_URL,
    openObserver: {
      next: () => {
        console.log('[WS] Connected')
        this.connectionStatus$.next(true)
      },
    },
    closeObserver: {
      next: () => {
        console.log('[WS] Disconnected')
        this.connectionStatus$.next(false)
        if (!this.manualClose) this.tryReconnect()
      },
    },
  })

  if (this.sub) this.sub.unsubscribe()

  this.sub = this.socket$
    .pipe(
      retryWhen((errors) =>
        errors.pipe(
          tap(() => {
            this.connectionStatus$.next(false)
          }),
          delayWhen(() => timer(this.reconnectInterval))
        )
      )
    )
    .subscribe(
      (msg) => this.incoming$.next(msg),
      (err) => console.error('[WS] subscription error', err)
    )
}


	private tryReconnect() {
		setTimeout(() => {
			if (!this.manualClose) {
				this.connect()
			}
		}, this.reconnectInterval)
	}

	public send(msg: WSMessage) {
		try {
			if (this.socket$) {
				this.socket$.next(msg)
			} else {
				console.warn('[WS] socket not ready')
			}
		} catch (e) {
			console.error('[WS] send error', e)
		}
	}

	public close() {
		this.manualClose = true
		if (this.socket$) {
			this.socket$.complete()
		}
		this.connectionStatus$.next(false)
		if (this.sub) this.sub.unsubscribe()
	}

	ngOnDestroy(): void {
		this.close()
		this.incoming$.complete()
		this.connectionStatus$.complete()
	}
}
