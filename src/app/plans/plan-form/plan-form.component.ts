import {Component, Inject, OnInit} from '@angular/core';
import {FormArray, FormBuilder, FormControl, FormGroup} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {Category} from 'src/app/api/categories.api';
import {Entry, Plan, PlansApi} from 'src/app/api/plans.api';
import {
  ApiProblem,
  ConstraintViolation,
  ConstraintViolationsProblem,
  isApiProblem,
  isConstraintViolation
} from 'src/app/api/problem';
import {CategoriesService} from 'src/app/categories.service';
import {Money} from 'ts-money';
import {PlanDefinition} from "../../api/plan-definitions.api";

@Component({
  selector: 'app-new-plan-form',
  templateUrl: './plan-form.component.html',
  styleUrls: ['./plan-form.component.css']
})
export class PlanFormComponent implements OnInit {

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
    public dialogRef: MatDialogRef<PlanFormComponent>,
    @Inject(MAT_DIALOG_DATA) private data: { planDefinition?: PlanDefinition },
    private formBuilder: FormBuilder,
    private categoriesApi: CategoriesService,
    private plansApi: PlansApi,
  ) {
  }

  ngOnInit(): void {
    this.initialize()
  }

  getEntries(): FormArray {
    return this.planForm.get('entries') as FormArray
  }

  getPeriodFormGroup(): FormGroup {
    return this.planForm.get('period') as FormGroup
  }

  addEntry(entry?: Entry): void {
    const entries = this.planForm.get('entries') as FormArray
    entries.push(this.createEntry(entry))
  }

  deleteEntry(index: number) {
    this.deselectCategoryAtIndex(index)
    this.getEntries().removeAt(index)
  }

  getCategoryName(category: Category): string {
    if (category != null) {
      return category.name
    } else {
      return ''
    }
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
    if (this.data.planDefinition?._links?.self.href) {
      this.plansApi
        .put(this.data.planDefinition._links.self.href, this.createPlanRequest())
        .subscribe(result => this.handleSubmitResult(result))
    } else {
      this.plansApi
        .post(this.createPlanRequest())
        .subscribe(result => this.handleSubmitResult(result))
    }
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

  private initialize() {
    this.categoriesApi
      .getCategories()
      .subscribe(categories => {
        this.allCategories = categories
        this.fetchAndApplyPlan()
      })
  }

  private createEntry(entry?: Entry): FormGroup {
    const categoryControl = this.formBuilder.control<Category | null>(null)
    categoryControl.valueChanges.subscribe(_ => this.updateSelectedCategories())
    if (entry) {
      const category = this.allCategories.find(cat => cat.id == entry.category.id)
      categoryControl.setValue(category!!)
    }

    return this.formBuilder.group({
      category: categoryControl,
      value: entry?.value?.amount ?? ''
    })
  }

  private fetchAndApplyPlan() {
    if (this.data.planDefinition?._links?.self.href) {
      this.plansApi
        .get(this.data.planDefinition?._links?.self.href)
        .subscribe(plan => this.applyPlan(plan))
    }
  }

  private applyPlan(plan: Plan) {
    this.planForm.get('name')?.setValue(plan.name)
    this.planForm.get('period')?.get('start')?.setValue(plan.period.start)
    this.planForm.get('period')?.get('end')?.setValue(plan.period.end)

    for (const entry of plan.entries) {
      this.addEntry(entry)
    }

    this.updateSelectedCategories()
  }

  private updateSelectedCategories() {
    this.selectedCategories = this.getEntries().controls
      .map(group => group.get('category') as FormControl)
      .map(control => (control.value as Category))
      .filter(category => category != null)
      .filter(category => category.id != undefined)
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

  private createPlanRequest(): Plan {
    return {
      id: this.data.planDefinition?.id,
      name: this.planForm.value['name'],
      period: {
        start: this.planForm.value['period']['start'],
        end: this.planForm.value['period']['end']
      },
      entries: this.planForm.value['entries']
        .map((entry: any) => {
          return {
            category: entry['category'],
            value: Money.fromDecimal(entry['value'], 'PLN')
          }
        })
    }
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
