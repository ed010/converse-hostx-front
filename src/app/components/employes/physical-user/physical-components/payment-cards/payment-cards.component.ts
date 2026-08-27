import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { UserService } from 'src/app/services/payx/user.service';
import { Card } from 'src/app/models/payx/card.model';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-payment-cards',
  templateUrl: './payment-cards.component.html',
  styleUrls: ['./payment-cards.component.css']
})
export class PaymentCardsComponent implements OnInit {

  cards:Card[]=[];
  currentCard: Card;

  selctedId:number=-1;
  cardeName: FormGroup;

  @ViewChild('closeEditCardModal') closeEditCardModal: ElementRef;
  @ViewChild('closeDeleteModal') closeDeleteModal: ElementRef;

  constructor(private userService:UserService, private formBuilder: FormBuilder) { }

  ngOnInit(): void {
    this.buildForm()
    this.userService.getCards().subscribe(
      res=>{
        this.cards=res as Card[];
      }
    )
  }

  buildForm()
  {
    this.cardeName = this.formBuilder.group({
      cardName: [null, [Validators.required]]
    })
  }

  selectCard(name)
  {
    this.cardeName.get('cardName').setValue(name)
    this.currentCard = this.cards.find(c => c.id == this.selctedId);

  }

  addCard(){
    this.userService.getCardRegLink().subscribe(
      res=>{
        window.location.href=res['link'];
      }
    )
  }

  changeCardName(){
    if(this.cardeName.get('cardName').value == null || this.cardeName.get('cardName').value == '')
      return;
    this.userService.changeCardName(this.cardeName.get('cardName').value,this.selctedId).subscribe(
      res=>{
        this.cards.find(c => c.id == this.selctedId).name = this.cardeName.get('cardName').value;
        this.closeEditCardModal.nativeElement.click()
      }
    )
  }

  setDefaultCard()
  {
    if(this.currentCard.isDefaultCard)
      return;
    this.userService.setDefaultCard(this.selctedId).subscribe(
      res =>
      {
        this.closeEditCardModal.nativeElement.click()
        this.ngOnInit();
      }
    )
  }

  closeCardEditModal()
  {
    this.closeEditCardModal.nativeElement.click()
  }

  deleteCard()
  {
    this.userService.deleteCard(this.selctedId).subscribe(
      res =>
      {
        this.closeDeleteModal.nativeElement.click()
        let index = this.cards.findIndex(c => c.id == this.selctedId)
        this.cards.splice(index, 1)
      }
    )
  }
}
