import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root',
})
export class VanillaService {
  static swal: typeof Swal = Swal;
  LoaderSubject = new BehaviorSubject(false);
}
