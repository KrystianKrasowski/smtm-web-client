import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { Category } from 'src/app/api/categories.api';
import { NewPlanRequest, Plan, PlansApi } from 'src/app/api/plans.api';
import { ApiProblem, ConstraintViolation, ConstraintViolationsProblem, isApiProblem, isConstraintViolation } from 'src/app/api/problem';
import { CategoriesService } from 'src/app/categories.service';
import { Money } from 'ts-money';

@Component({
  selector: 'app-new-plan-form',
  templateUrl: './new-plan-form.component.html',
  styleUrls: ['./new-plan-form.component.css']
})
export class NewPlanFormComponent implements OnInit {

  planForm: FormGroup = this.formBuilder.group({
    name: this.formBuilder.control(''),
    period: this.formBuilder.group({
      start: this.formBuilder.control<Date | null>(null),
      end: this.formBuilder.control<Date | null>(null)
    }),
    entries: this.formBuilder.array([])
  })

  allCategories: Category[] = []

  selectedCategories: Category[] = []

  sum: number = 0

  constructor(
    public dialogRef: MatDialogRef<NewPlanFormComponent>,
    private formBuilder: FormBuilder, 
    private categoryService: CategoriesService,
    private plansApi: PlansApi
  ) { }

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

  getPeriodFormGroup(): FormGroup {
    return this.planForm.get('period') as FormGroup
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

  sumUp() {
    this.sum = this.getEntries()
      .controls
      .map(formGroup => formGroup.get('value'))
      .map(valueControl => valueControl?.value ?? 0)
      .reduce((sum, current) => sum + current, 0)
  }

  submit() {
    this.plansApi
      .post(this.createNewPlanRequest())
      .subscribe(result => this.handleSubmitResult(result))
  }

  getNameViolation(): string | undefined {
    return this.planForm.getError('api', 'name')
  }

  getPeriodStartViolation(): string | undefined {
    return this.planForm.getError('api', 'period.start')
  }

  getPeriodEndViolation(): string | undefined {
    return this.planForm.getError('api', 'period.end')
  }

  getCategoryViolation(index: number): string | undefined {
    return this.planForm.getError('api', 'entries.' + index + '.category')
  }

  getValueViolation(index: number): string | undefined {
    return this.planForm.getError('api', 'entries.' + index + '.value')
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

  private createNewPlanRequest(): NewPlanRequest {
    const request: NewPlanRequest = {
      name: this.planForm.value['name'],
      period: {
        start: this.planForm.value['period']['start'],
        end: this.planForm.value['period']['end']
      },
      entries: this.planForm.value['entries']
        .map((entry: any) => {
          return {
            category: entry['category']['id'],
            value: Money.fromDecimal(entry['value'], 'PLN')
          }
        })
    }
    return request
  }

  private handleSubmitResult(result: Plan | ConstraintViolationsProblem | ApiProblem) {
    if (isConstraintViolation(result)) {
      result.violations.forEach(violation => this.applyError(violation))
    } else if (isApiProblem(result)) {
      this.dialogRef.close(false)
    } else {
      this.dialogRef.close(true)
    }
  }

  private applyError(violation: ConstraintViolation) {
    this.planForm
      .get(jsonPathToFormPath(violation.path))
      ?.setErrors({
        api: violation.message
      })
  }

  private close() {
    this.dialogRef.close(true)
  }
}

function jsonPathToFormPath(path: string): string {
  return path
    .replace('$.', '')
    .split('.')
    .map(segment => {
      let index = segment.match(/\[(\d+)\]$/)?.[1]
      if (index) {
        return segment.replace('[' + index + ']', '') + '.' + index
      } else {
        return segment
      }
    })
    .join('.')
}