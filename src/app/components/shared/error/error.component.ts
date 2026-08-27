import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-error',
  templateUrl: './error.component.html',
  styleUrls: ['./error.component.css']
})
export class ErrorComponent implements OnInit {

  @Input() text:string;
  @Output() ok=new EventEmitter();
  constructor() { }

  ngOnInit() {
  }
  onOkClick(){
    this.ok.emit();
  }

}
