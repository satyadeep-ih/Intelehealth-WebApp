import { VisitService } from 'src/app/services/visit.service';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EncounterService } from 'src/app/services/encounter.service';

@Component({
  selector: 'app-vital',
  templateUrl: './vital.component.html',
  styleUrls: ['./vital.component.css']
})
export class VitalComponent implements OnInit {
answer: any = [];
dignosis: any = [];
v: any = [];
d: any = [];
vitalsPresent = false;
  constructor(private route: ActivatedRoute,
              private visitService: VisitService,
              private service: EncounterService) { }

  ngOnInit() {
    const visitUuid = this.route.snapshot.paramMap.get('visit_id');
      this.visitService.fetchVisitDetails(visitUuid)
      .subscribe(visits => {
        visits.encounters.forEach(visit => {
          const display = visit.display;
          if (visit.display.match('Vitals') !== null ) {
            this.vitalsPresent = true;
            this.answer.date = display.split(' ')[1];
            const vitalUUID = visit.uuid;
            this.service.vitals(vitalUUID)
            .subscribe(vitals => {
              const vital = vitals.obs;
              vital.forEach(obs => {
                const displayObs = obs.display;
                if (displayObs.match('SYSTOLIC') !== null ) {
                  this.answer.sbp = Number(obs.display.slice(25, obs.display.length));
                }
                if (displayObs.match('DIASTOLIC') !== null ) {
                  this.answer.dbp = Number(obs.display.slice(26, obs.display.length));
                }
                if (displayObs.match('Weight') !== null ) {
                  this.answer.weight = Number(obs.display.slice(13, obs.display.length));
                }
                if (displayObs.match('Height') !== null ) {
                  this.answer.height = Number(obs.display.slice(13, obs.display.length));
                }
                if (displayObs.match('BLOOD OXYGEN SATURATION') !== null ) {
                  this.answer.sp02 = Number(obs.display.slice(25, obs.display.length));
                }
                if (displayObs.match('TEMP') !== null ) {
                  this.answer.temp = Number(obs.display.slice(17, obs.display.length));
                }
                if (displayObs.match('Pulse') !== null ) {
                  this.answer.pulse = Number(obs.display.slice(7, obs.display.length));
                }
                if (displayObs.match('Respiratory rate') !== null ) {
                  this.answer.respiratoryRate = Number(obs.display.slice(18, obs.display.length));
                }
                if (displayObs.match('BLOOD_GLUCOSE_AFTER_FOOD') !== null ) {
                  this.dignosis.glucoseAf = Number(obs.display.slice(26, obs.display.length));
                }
                if (displayObs.match('Blood Glucose') !== null ) {
                  this.dignosis.glucoseF = Number(obs.display.slice(26, obs.display.length));
                }
                if (displayObs.match('Haemoglobin') !== null ) {
                  this.dignosis.hgb = Number(obs.display.slice(23, obs.display.length));
                }
                if (displayObs.match('Uric Acid') !== null ) {
                  this.dignosis.uricAcid = Number(obs.display.slice(11, obs.display.length));
                }
                if (displayObs.match('Total Chlolestrol') !== null ) {
                  this.dignosis.totalChlolestrol = Number(obs.display.slice(19, obs.display.length));
                }
                if (displayObs.match('BLOOD_GLUCOSE_RANDOM_ID') !== null ) {
                  this.dignosis.glucoseRandom =  Number(obs.display.slice(24, obs.display.length));
                }
                if (displayObs.match('BLOOD_GLUCOSE_POST_PRANDIAL_ID') !== null ) {
                  this.dignosis.glucosePostPrandial = Number(obs.display.slice(32, obs.display.length));
                }
              });
              this.v.push(this.answer);
              this.d.push(this.dignosis);
            });
          }
        });
      });
}
}
