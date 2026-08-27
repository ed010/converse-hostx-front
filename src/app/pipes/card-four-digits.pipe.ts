import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
  name: "creditCardDigits",
})
export class LastFourDigitsPipe implements PipeTransform {
  transform(value: string): string {
    if (value == null) {
      return "";
    }
    const trimmed = String(value).trim();
    if (!trimmed) {
      return "";
    }
    return "********" + trimmed.slice(-4);
  }
}
