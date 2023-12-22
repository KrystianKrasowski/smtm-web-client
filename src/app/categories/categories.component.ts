import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { Label } from '../api/labels-api.service';
import { ConstraintViolationsProblem, isConstraintViolation } from '../api/problem';
import { LabelsService } from '../labels.service';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-categories',
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.css']
})
export class CategoriesComponent {

  name = new FormControl('')

  selectedCategory?: Label;

  categoryList: Observable<Label[]>

  constructor(private dialog: MatDialog, private labels: LabelsService) {
    this.categoryList = labels.getLabels()
  }

  onCategoryTap(category: Label): void {
    this.selectedCategory = this.selectedCategory != category
      ? category
      : undefined

    this.name.setValue(this.selectedCategory?.name ?? '')
  }

  onCategorySave(): void {
    const name = this.name.value ?? ''
    this.labels
      .save(name, this.selectedCategory)
      .subscribe((result) => this.handleSaveResult(result))
  }

  onCategoryDelete(): void {
    this.dialog
      .open(ConfirmDialogComponent, {
        data: `Delete ${this.selectedCategory?.name} category?`
      })
      .afterClosed()
      .subscribe(confirmed => this.deleteSelectedCategoryIf(confirmed))
  }

  isCategorySelected(): boolean {
    return this.selectedCategory != undefined;
  }

  private handleSaveResult(result: Label | ConstraintViolationsProblem) {
    if (isConstraintViolation(result)) {
      this.name.setErrors({
        name: result.violations.find((v) => v.path === 'name')?.message
      })
    }
  }

  private deleteSelectedCategoryIf(condition: boolean) {
    if (condition && this.selectedCategory) {
      this.labels
        .delete(this.selectedCategory)
        .subscribe(() => {
          this.selectedCategory = undefined
          this.name.setValue('')
          this.categoryList = this.labels.getLabels()
        })
    }
  }
}
