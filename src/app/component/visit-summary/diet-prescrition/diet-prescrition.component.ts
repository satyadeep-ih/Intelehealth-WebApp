import { Component, EventEmitter, OnInit, Output } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { EncounterService } from "src/app/services/encounter.service";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { DiagnosisService } from "src/app/services/diagnosis.service";
import { Observable } from "rxjs";
import { debounceTime, distinctUntilChanged, map } from "rxjs/operators";
import {
  transition,
  trigger,
  style,
  animate,
  keyframes,
} from "@angular/animations";
declare var getEncounterUUID: any;

@Component({
  selector: 'app-diet-prescrition',
  templateUrl: './diet-prescrition.component.html',
  styleUrls: ['./diet-prescrition.component.css'],
  animations: [
    trigger("moveInLeft", [
      transition("void=> *", [
        style({ transform: "translateX(300px)" }),
        animate(
          200,
          keyframes([
            style({ transform: "translateX(300px)" }),
            style({ transform: "translateX(0)" }),
          ])
        ),
      ]),
      transition("*=>void", [
        style({ transform: "translateX(0px)" }),
        animate(
          100,
          keyframes([
            style({ transform: "translateX(0px)" }),
            style({ transform: "translateX(300px)" }),
          ])
        ),
      ]),
    ]),
  ],
})
export class DietPrescritionComponent implements OnInit {
  @Output() isDataPresent = new EventEmitter<boolean>();
  prescritions: any = [];
  prescrition = [];
  conceptprescrition = "23601d71-50e6-483f-968d-aeef3031346d";
  encounterUuid: string;
  patientId: string;
  visitUuid: string;
  errorText: string;

  prescritionForm = new FormGroup({
    prescrition: new FormControl("", [Validators.required]),
  });
  
  constructor(
    private service: EncounterService,
    private diagnosisService: DiagnosisService,
    private route: ActivatedRoute
  ) { }

  search = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      map((term) =>
        term.length < 1
          ? []
          : this.prescrition
            .filter((v) => v.toLowerCase().indexOf(term.toLowerCase()) > -1)
            .slice(0, 10)
      )
    );

  ngOnInit() {
    const prescritionUuid = "98c5881f-b214-4597-83d4-509666e9a7c9";
    this.diagnosisService.concept(prescritionUuid).subscribe((res) => {
      const result = res.answers;
      result.forEach((ans) => {
        this.prescrition.push(ans.display);
      });
    });
    this.visitUuid = this.route.snapshot.paramMap.get("visit_id");
    this.patientId = this.route.snapshot.params["patient_id"];
    this.diagnosisService
      .getObs(this.patientId, this.conceptprescrition)
      .subscribe((response) => {
        response.results.forEach((obs) => {
          if (obs.encounter.visit.uuid === this.visitUuid) {
            this.prescritions.push(obs);
          }
        });
      });
  }

  submit() {
    const date = new Date();
    const form = this.prescritionForm.value;
    const value = form.prescrition;
    if (this.diagnosisService.isSameDoctor()) {
      this.encounterUuid = getEncounterUUID();
      const json = {
        concept: this.conceptprescrition,
        person: this.patientId,
        obsDatetime: date,
        value: value,
        encounter: this.encounterUuid,
      };
      this.service.postObs(json).subscribe((resp) => {
        this.isDataPresent.emit(true);
        this.prescritions.push({ uuid: resp.uuid, value: value });
      });
    }
  }


  delete(i) {
    if (this.diagnosisService.isSameDoctor()) {
      const uuid = this.prescritions[i].uuid;
      this.diagnosisService.deleteObs(uuid).subscribe((res) => {
        this.prescritions.splice(i, 1);
        if (this.prescritions.length === 0) {
          this.isDataPresent.emit(false);
        }
      });
    }
  }
}
