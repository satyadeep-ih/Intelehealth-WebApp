import { Component, EventEmitter, OnInit, Output } from "@angular/core";
import { EncounterService } from "src/app/services/encounter.service";
import { ActivatedRoute } from "@angular/router";
import { DiagnosisService } from "src/app/services/diagnosis.service";
import { Validators, FormGroup, FormControl } from "@angular/forms";
import {
  transition,
  trigger,
  style,
  animate,
  keyframes,
} from "@angular/animations";
declare var getEncounterUUID: any;

@Component({
  selector: 'app-weight-history',
  templateUrl: './weight-history.component.html',
  styleUrls: ['./weight-history.component.css'],
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
export class WeightHistoryComponent implements OnInit {
  @Output() isDataPresent = new EventEmitter<boolean>();
  History: any = [];
  HistoryList = [];
  conceptDiagnosis = "537bb20d-d09d-4f88-930b-cc45c7d662df";
  patientId: string;
  visitUuid: string;
  encounterUuid: string;

  weighthistoryForm = new FormGroup({
    text: new FormControl("", [Validators.required]),
    type: new FormControl("", [Validators.required]),
    confirm: new FormControl("", [Validators.required]),
  });

  constructor(
    private service: EncounterService,
    private diagnosisService: DiagnosisService,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    this.visitUuid = this.route.snapshot.paramMap.get("visit_id");
    this.patientId = this.route.snapshot.params["patient_id"];
    this.diagnosisService
      .getObs(this.patientId, this.conceptDiagnosis)
      .subscribe((response) => {
        response.results.forEach((obs) => {
          if (obs.encounter.visit.uuid === this.visitUuid) {
            this.History.push(obs);
          }
        });
      });
  }

  search(event) {
    this.diagnosisService
      .getDiagnosisList(event.target.value)
      .subscribe((response) => {
        this.HistoryList = response;
      });
  }

  onSubmit() {
    const date = new Date();
    const value = this.weighthistoryForm.value;
    if (this.diagnosisService.isSameDoctor()) {
      this.encounterUuid = getEncounterUUID();
      const json = {
        concept: this.conceptDiagnosis,
        person: this.patientId,
        obsDatetime: date,
        value: `${value.text}:${value.type} & ${value.confirm}`,
        encounter: this.encounterUuid,
      };
      this.service.postObs(json).subscribe((resp) => {
        this.isDataPresent.emit(true);
        this.HistoryList = [];
        this.History.push({ uuid: resp.uuid, value: json.value });
      });
    }
  }

  delete(i) {
    if (this.diagnosisService.isSameDoctor()) {
      const uuid = this.History[i].uuid;
      this.diagnosisService.deleteObs(uuid).subscribe((res) => {
        this.History.splice(i, 1);
        if (this.History.length === 0) {
          this.isDataPresent.emit(false);
        }
      });
    }
  }
}

