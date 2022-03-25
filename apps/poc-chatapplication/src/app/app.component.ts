import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { VanillaService } from './services/Vanilla.service';
// import { VanillaService } from './services/Vanilla.service';

@Component({
  selector: 'thought-focus-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  Loader!:Observable<boolean>;
  constructor(vanil:VanillaService) {
    this.Loader = vanil.LoaderSubject.asObservable()
    // VanillaService.swal.fire(
    //   'asdasdasdasdasdasd',
    //   'VDGVHIUOJIUBHADGJSHKD',
    //   'success'
    // );
  }
}
