import { Component, inject } from '@angular/core';
import { StringsService } from '../services/strings.service';

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.page.html',
  styleUrls: ['./welcome.page.scss'],
  standalone: false,
})
export class WelcomePage {
  public strings = inject(StringsService);
}