import {Component} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {Observable} from 'rxjs';
import {PlanDefinition, PlanDefinitionsApi} from '../api/plan-definitions.api';
import {PlanFormComponent} from "./plan-form/plan-form.component";

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

  openPlanForm(plan?: PlanDefinition) {
    this.dialog
      .open(PlanFormComponent, {
        width: '1000px',
        data: {
          planDefinition: plan
        }
      })
      .afterClosed()
      .subscribe(result => console.log(result))
  }
}
