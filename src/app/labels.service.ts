import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {Label, LabelsApi} from './api/labels-api.service';
import {ConstraintViolationsProblem} from './api/problem';

@Injectable({
  providedIn: 'root'
})
export class LabelsService {

  constructor(private api: LabelsApi) { }

  getLabels(): Observable<Label[]> {
    return this.api.getAll();
  }

  save(name: string, label?: Label): Observable<Label | ConstraintViolationsProblem> {
    if (label) {
      return this.update(label, name)
    } else {
      return this.create(name)
    }
  }

  delete(label: Label): Observable<void> {
    return this.api.delete(label)
  }

  private update(label: Label, name: string): Observable<Label | ConstraintViolationsProblem> {
    label.name = name
    return this.api.put(label)
  }

  private create(name: string): Observable<Label | ConstraintViolationsProblem> {
    return this.api.post({
      name: name
    });
  }
}
