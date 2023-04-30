import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Category } from '../api/categories.api';
import { NewPlanFormComponent } from './new-plan-form/new-plan-form.component';

@Component({
  selector: 'app-plans',
  templateUrl: './plans.component.html',
  styleUrls: ['./plans.component.css']
})
export class PlansComponent {

  constructor(private dialog: MatDialog) { }

  onPlanSelect() {
    console.log('Plan selected!')
  }

  openNewPlanForm() {
    this.dialog.open(NewPlanFormComponent, {
      width: '1000px'
    })
  }
}
