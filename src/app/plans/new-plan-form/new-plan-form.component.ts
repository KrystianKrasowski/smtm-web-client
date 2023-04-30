import { Component, Inject, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Observable, filter, map } from 'rxjs';
import { Category } from 'src/app/api/categories.api';
import { CategoriesService } from 'src/app/categories.service';

@Component({
  selector: 'app-new-plan-form',
  templateUrl: './new-plan-form.component.html',
  styleUrls: ['./new-plan-form.component.css']
})
export class NewPlanFormComponent implements OnInit {

  planForm: FormGroup = this.formBuilder.group({
    entries: this.formBuilder.array([])
  })

  allCategories: Category[] = []

  selectedCategories: Category[] = []

  constructor(private formBuilder: FormBuilder, private categoryService: CategoriesService) { }

  ngOnInit(): void {
    this.categoryService.getCategories()
      .subscribe(categories => this.allCategories = categories)
  }

  createEntry(): FormGroup {
    const categoryControl = this.formBuilder.nonNullable.control('category')
    categoryControl.valueChanges.subscribe(_ => this.updateSelectedCategories())

    return this.formBuilder.group({
      category: categoryControl,
      value: ''
    })
  }

  getEntries(): FormArray {
    return this.planForm.get('entries') as FormArray
  }

  addEntry(): void {
    const entries = this.planForm.get('entries') as FormArray
    entries.push(this.createEntry())
  }

  deleteEntry(index: number) {
    this.deselectCategoryAtIndex(index)
    this.getEntries().removeAt(index)
  }

  getCategoryName(category: Category): string {
    return category.name
  }

  getAvailableCategories(): Category[] {
    return this.allCategories
      .filter(category => !this.selectedCategories.includes(category))
  }

  private updateSelectedCategories() {
    const categories = this.getEntries().controls
      .map(group => group.get('category') as FormControl)
      .map(control => control.value as Category)
      .filter(category => category.id != undefined)

    this.selectedCategories = categories
  }

  private deselectCategoryAtIndex(index: number) {
    const value = this.getEntries().at(index)?.value

    if (value) {
      const category = value.category as Category
      const i = this.selectedCategories.indexOf(category)
      
      if (i >= 0) {
        delete this.selectedCategories[i]
      }
    }
  }
}