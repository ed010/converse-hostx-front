import { Component, OnInit, Input, Output, EventEmitter} from '@angular/core';

@Component({
  selector: 'app-success',
  templateUrl: './success.component.html',
  styleUrls: ['./success.component.css']
})
export class SuccessComponent implements OnInit {

  @Input() text:string;
  @Output() ok=new EventEmitter();
  constructor() { }

  ngOnInit() {
  }

  onOkClick(){
    this.ok.emit();
  }

}
