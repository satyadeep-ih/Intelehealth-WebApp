import { PushNotificationsService } from "src/app/services/push-notification.service";
import { VisitService } from "../../services/visit.service";
import { Component, OnInit } from "@angular/core";
import { EncounterService } from "src/app/services/encounter.service";
import { ActivatedRoute, Router } from "@angular/router";
import { AuthService } from "src/app/services/auth.service";
import { VcComponent } from "../vc/vc.component";
import { MatDialog } from "@angular/material/dialog";
import { environment } from "src/environments/environment";
import { TranslationService } from "src/app/services/translation.service";
declare var getFromStorage: any,
  saveToStorage: any,
  getEncounterProviderUUID: any;

@Component({
  selector: "app-visit-summary",
  templateUrl: "./visit-summary.component.html",
  styleUrls: ["./visit-summary.component.css"],
})
export class VisitSummaryComponent implements OnInit {
  show = false;
  text: string;
  font: string;
  visitNotePresent = false;
  visitCompletePresent = false;
  remotePrescriptionPresent = false;
  setSpiner = true;
  doctorDetails;
  doctorValue;
  patientUuid = "";
  visitUuid = "";
  isVisitEnded:boolean = false;
  videoIcon = environment.production
    ? "../../../intelehealth/assets/svgs/video-w.svg"
    : "../../../assets/svgs/video-w.svg";

  constructor(
    private service: EncounterService,
    private visitService: VisitService,
    private authService: AuthService,
    private translationService: TranslationService,
    private route: ActivatedRoute,
    private router: Router,
    private pushNotificationService: PushNotificationsService,
    private dialog: MatDialog
  ) {
    this.router.routeReuseStrategy.shouldReuseRoute = function () {
      return false;
    };
  }

  ngOnInit() {
    setTimeout(() => {
      this.setSpiner = false;
    }, 1000);
    this.patientUuid = this.route.snapshot.paramMap.get("patient_id");
    this.visitUuid = this.route.snapshot.paramMap.get("visit_id");
    this.visitService
      .fetchVisitDetails(this.visitUuid)
      .subscribe((visitDetails) => {
        visitDetails.encounters.forEach((visit) => {
          if (visit.display.match("Visit Note") !== null) {
            saveToStorage("visitNoteProvider", visit);
            this.visitNotePresent = true;
            this.show = true;
          }
          if (visit.display.match("Remote Prescription") !== null) {
             this.remotePrescriptionPresent = true;
             this.show = true;
          }
          if (visit.display.match("Visit Complete") !== null) {
            this.visitCompletePresent = true;
            visit.encounterProviders[0].provider.attributes.forEach(
              (element) => {
                if (element.attributeType.display === "textOfSign") {
                  this.text = element.value;
                }
                if (element.attributeType.display === "fontOfSign") {
                  this.font = element.value;
                }
              }
            );
          }
          if (
            visit.display.includes("ADULTINITIAL") |
            visit.display.includes("Vitals")
          ) {
            saveToStorage("patientVisitProvider", visit.encounterProviders[0]);
          }
        });
        if (visitDetails.stopDatetime !== null) {
          this.isVisitEnded = true;
        }
      });
      this.translationService.getSelectedLanguage();
  }

  onStartVisit() {
    const myDate = new Date(Date.now() - 30000);
    if (!this.visitNotePresent) {
      const userDetails = getFromStorage("user");
      const providerDetails = getFromStorage("provider");
      const attributes = providerDetails.attributes;
      if (userDetails && providerDetails) {
        const providerUuid = providerDetails.uuid;
        const json = {
          patient: this.patientUuid,
          encounterType: "d7151f82-c1f3-4152-a605-2f9ea7414a79",
          encounterProviders: [
            {
              provider: providerUuid,
              encounterRole: "73bbb069-9781-4afc-a9d1-54b6b2270e03",
            },
          ],
          visit: this.visitUuid,
          encounterDatetime: myDate,
        };
        this.service.postEncounter(json).subscribe((response) => {
          if (response) {
            this.visitNotePresent = true;
            this.visitService
              .fetchVisitDetails(this.visitUuid)
              .subscribe((visitDetails) => {
                saveToStorage("visitNoteProvider", visitDetails.encounters[0]);
              });
            this.show = true;
            this.translationService.getTranslation(`Visit Note Created`);
            attributes.forEach((element) => {
              if (
                element.attributeType.uuid ===
                  "ed1715f5-93e2-404e-b3c9-2a2d9600f062" &&
                !element.voided
              ) {
                const payload = {
                  speciality: element.value,
                  patient: {
                    name: response.patient.display,
                    provider: response.encounterProviders[0].display,
                  },
                  skipFlag: true,
                };
                if (!this.pushNotificationService.snoozeTimeout) {
                  this.pushNotificationService
                    .postNotification(payload)
                    .subscribe();
                }
              }
            });
          } else {
            this.translationService.getTranslation(`Visit Note Not Created`);
          }
        });
      } else {
        this.authService.logout();
      }
    }
  }

  sign() {
    const myDate = new Date(Date.now() - 30000);
    const userDetails = getFromStorage("user");
    const providerDetails = getFromStorage("provider");
    if (userDetails && providerDetails) {
      this.doctorDetails = providerDetails;
      this.getDoctorValue();
      const providerUuid = providerDetails.uuid;
      if (providerUuid === getEncounterProviderUUID()) {
        this.service.signRequest(providerUuid).subscribe((res) => {
          if (res.results.length) {
            res.results.forEach((element) => {
              if (element.attributeType.display === "textOfSign") {
                this.text = element.value;
              }
              if (element.attributeType.display === "fontOfSign") {
                this.font = element.value;
              }
            });
            const json = {
              patient: this.patientUuid,
              encounterType: "a85f96d1-1246-4263-bfd0-00780c27a018",
              encounterProviders: [
                {
                  provider: providerUuid,
                  encounterRole: "73bbb069-9781-4afc-a9d1-54b6b2270e03",
                },
              ],
              visit: this.visitUuid,
              encounterDatetime: myDate,
              // obs: [
              //   {
              //     concept: "7a9cb7bc-9ab9-4ff0-ae82-7a1bd2cca93e",
              //     value: JSON.stringify(this.doctorValue),
              //   },
              // ],
            };
            this.service.postEncounter(json).subscribe((post) => {
              this.remotePrescriptionPresent = true;
              this.router.navigateByUrl("/home");
              this.translationService.getTranslation("Prescription added for review");
            });
          } else {
            if (
              window.confirm(
                'Your signature is not setup! If you click "Ok" you would be redirected. Cancel will load this website '
              )
            ) {
              this.router.navigateByUrl("/myAccount");
            }
          }
        });
      } else {
        this.translationService.getTranslation("Another doctor is viewing this case");
      }
    } else {
      this.authService.logout();
    }
  }

  getDoctorValue = () => {
    const doctor = {};
    doctor["name"] = this.doctorDetails.person.display;
    // tslint:disable-next-line: max-line-length
    const doctorAttributes = [
      "phoneNumber",
      "qualification",
      "whatsapp",
      "emailId",
      "registrationNumber",
      "specialization",
      "address",
      "fontOfSign",
      "textOfSign",
    ];
    doctorAttributes.forEach((attr) => {
      const details = this.filterAttributes(
        this.doctorDetails.attributes,
        attr
      );
      if (details.length) {
        doctor[attr] = details[details.length - 1].value;
      }
    });
    this.doctorValue = doctor;
  };

  filterAttributes = (data, text) => {
    return data.filter(
      (attr) =>
        attr.attributeType["display"].toLowerCase() === text.toLowerCase()
    );
  };

  openVcModal() {
    this.dialog.open(VcComponent, {
      disableClose: true,
      data: {
        patientUuid: this.patientUuid,
      },
    });
  }
}
