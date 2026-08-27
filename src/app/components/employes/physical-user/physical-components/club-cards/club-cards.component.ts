import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { UserService } from 'src/app/services/payx/user.service';
import { DiscountCard } from 'src/app/models/payx/discountCard.model';


@Component({
  selector: 'app-club-cards',
  templateUrl: './club-cards.component.html',
  styleUrls: ['./club-cards.component.css']
})
export class ClubCardsComponent implements OnInit {

  newCard:DiscountCard=new DiscountCard();
  updateCard:DiscountCard=new DiscountCard();

  errorToggle:boolean=false;
  errorMessage:string='';

  cards:DiscountCard[]=[];
  deleteClubCardId = -1

  profilePicBase64!: string | ArrayBuffer;

  background: string = "none"


  @ViewChild('clodeDeleteModal') clodeDeleteModal: ElementRef
  @ViewChild('closeUpdateModal') closeUpdateModal: ElementRef
  @ViewChild('close') close: ElementRef
  constructor(private userService:UserService) {
   }

  ngOnInit(): void {
    this.userService.getClubCards().subscribe(
      res=>{
        this.cards=res as DiscountCard[];
      },
      err=>{
        this.errorMessage="Sorry your connection unstabil"
        this.errorToggle=true;
      }
    )

  }

  onUploadImage(event: any,type:number)
  {
    let file = event.target.files[0];

      const reader = new FileReader()
      reader.onload = () =>
      {
        this.profilePicBase64 = reader.result as string;
        let imageText: string = this.profilePicBase64 as string;
        // imageText = imageText.replace(/^data:image\/[a-z]+;base64,/, '');
        if(type==1)
          this.newCard.imgData=imageText;
        else
          this.newCard.imgDataBack=imageText;
      }
      reader.readAsDataURL(file);

  }


  addCard(){
    this.newCard.id=-1;
    this.userService.addClubCard(this.newCard).subscribe(
      res=>{
        this.ngOnInit();
        this.close.nativeElement.click()
        this.newCard.barCode = ''
        this.newCard.imgData = ''
        this.newCard.imgDataBack = ''
        this.newCard.name = ''
        this.newCard.imgData='';
        this.newCard.imgDataBack='';
      },
      err=>{
        this.errorMessage="Sorry something wants wrong, check your details and try again"
        this.errorToggle=true;
      }
    )
  }

  onUpdateCardClick(){
    this.userService.updateClubCard(this.newCard).subscribe(
      res=>{
        this.closeUpdateModal.nativeElement.click();
        this.ngOnInit();
      },
      err=>{
        this.errorMessage="Sorry something wants wrong, check your details and try again"
        this.errorToggle=true;
      }
    )
  }

  deleteCard()
  {
    this.userService.deleteClubCard(this.deleteClubCardId).subscribe(
      res =>
      {
        let index = this.cards.findIndex(c => c.id == this.deleteClubCardId)
        this.cards.splice(index, 1)
        this.clodeDeleteModal.nativeElement.click()
      },
      err=>{
        this.errorMessage="Sorry something wants wrong"
        this.errorToggle=true;
      }
    )
  }

}
