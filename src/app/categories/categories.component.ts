import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { Category } from '../api/categories.api';
import { ConstraintViolationsProblem, isConstraintViolation } from '../api/problem';
import { CategoriesService } from '../categories.service';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-categories',
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.css']
})
export class CategoriesComponent {

  name = new FormControl('')

  selectedCategory?: Category;

  categoryList: Observable<Category[]>

  constructor(private dialog: MatDialog, private categories: CategoriesService) {
    this.categoryList = categories.getCategories()
  }

  onCategoryTap(category: Category): void {
    this.selectedCategory = this.selectedCategory != category
      ? category
      : undefined

    this.name.setValue(this.selectedCategory?.name ?? '')
  }

  onCategorySave(): void {
    const name = this.name.value ?? ''
    this.categories
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
    return this.selectedCategory != undefined && this.selectedCategory != null;
  }

  private handleSaveResult(result: Category | ConstraintViolationsProblem) {
    if (isConstraintViolation(result)) {
      this.name.setErrors({
        name: result.violations.find((v) => v.path === 'name')?.message
      })
    }
  }

  private deleteSelectedCategoryIf(condition: boolean) {
    if (condition && this.selectedCategory) {
      this.categories
        .delete(this.selectedCategory)
        .subscribe(() => {
          this.selectedCategory = undefined
          this.name.setValue('')
          this.categoryList = this.categories.getCategories()
        })
    }
  }
}