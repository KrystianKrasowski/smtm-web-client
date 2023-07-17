import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { PlanList, PlansApi } from '../api/plans.api';
import { NewPlanFormComponent } from './new-plan-form/new-plan-form.component';
import { PlanDefinition, PlanDefinitionsApi } from '../api/plan-definitions.api';

@Component({
  selector: 'app-plans',
  templateUrl: './plans.component.html',
  styleUrls: ['./plans.component.css']
})
export class PlansComponent {

  currentPlans$: Observable<PlanDefinition[]>
  upcomingPlans$: Observable<PlanDefinition[]>
  archivedPlans$: Observable<PlanDefinition[]>

  constructor(private plansApi: PlanDefinitionsApi, private dialog: MatDialog) {
    this.currentPlans$ = this.plansApi.getCurrentPlans()
    this.upcomingPlans$ = this.plansApi.getUpcomingPlans()
    this.archivedPlans$ = this.plansApi.getArchivedPlans()
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
