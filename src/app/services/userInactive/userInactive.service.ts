import { HostListener, Injectable, OnDestroy } from '@angular/core';
import { fromEvent, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserInactiveService implements OnDestroy {

  public idle$: Subject<boolean> = new Subject();
  public wake$: Subject<boolean> = new Subject();
  isIdle = false;
  private idleAfterSeconds = 3;
  private countDown;
  constructor() {
      fromEvent(document, 'mousemove').subscribe(() => this.onInteraction());
      fromEvent(document, 'touchstart').subscribe(() => this.onInteraction());
      fromEvent(document, 'scroll').subscribe(() => this.onInteraction())
      fromEvent(document, 'click').subscribe(() => this.onInteraction())
      fromEvent(document, 'keydown').subscribe(() => this.onInteraction());
  }
  onInteraction() {
    {
      // Is idle and interacting, emit Wake
      if (this.isIdle) {
        this.isIdle = false;
        try{
          this.wake$.next(true);
        }
        catch{
          console.log("Next Error")
        }
    }
    // User interaction, reset start-idle-timer
    clearTimeout(this.countDown);
    this.countDown = setTimeout(() => {
        // Countdown done without interaction - emit Idle
        this.isIdle = true;
        try{
          this.idle$.next(true);
        }
        catch{
          console.log("Next Error")
        }
    }, this.idleAfterSeconds * 1_000)
    }

  }

  ngOnDestroy(): void {
    this.wake$.unsubscribe();
    this.idle$.unsubscribe();
  }
}

