import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { PlanList, PlansApi } from '../api/plans.api';
import { NewPlanFormComponent } from './new-plan-form/new-plan-form.component';

@Component({
  selector: 'app-plans',
  templateUrl: './plans.component.html',
  styleUrls: ['./plans.component.css']
})
export class PlansComponent {

  plansList$: Observable<PlanList>

  constructor(private plansApi: PlansApi, private dialog: MatDialog) {
    this.plansList$ = this.plansApi.getAll()
  }

  onPlanSelect() {
    console.log('Plan selected!')
  }

  openNewPlanForm() {
    this.dialog
      .open(NewPlanFormComponent, {
        width: '1000px'
      })
      .afterClosed()
      .subscribe(result => console.log(result))
  }
}
