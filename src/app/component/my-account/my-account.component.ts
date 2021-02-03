import { SessionService } from "src/app/services/session.service";
import { AuthService } from "src/app/services/auth.service";
import { Component, OnInit } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { MatDialog } from "@angular/material/dialog";
import { SignatureComponent } from "./signature/signature.component";
import { EditDetailsComponent } from "./edit-details/edit-details.component";
import { environment } from "../../../environments/environment";
import { ProviderService } from "src/app/services/provider.service";
declare var getFromStorage: any;

@Component({
  selector: "app-my-account",
  templateUrl: "./my-account.component.html",
  styleUrls: ["./my-account.component.css"],
})
export class MyAccountComponent implements OnInit {
  baseURL = environment.baseURL;
  setSpiner: boolean = true;

  name = "Enter text";
  providerDetails = null;
  userDetails: any;
  constructor(
    private sessionService: SessionService,
    private http: HttpClient,
    private dialog: MatDialog,
    private provider: ProviderService
  ) {}

  ngOnInit() {
    this.setSpiner = true;
    this.userDetails = getFromStorage("user");
    this.sessionService
      .provider(this.userDetails.uuid)
      .subscribe((provider) => {
        this.provider.providerDetails = provider.results;
        this.provider.providerDetails.forEach((provider) => {
          const signAttr = provider.attributes.find(
            (p) => p.attributeType.uuid === this.provider.signAttributeType
          );
          if (!signAttr) this.providerDetails = provider;
        });
        if (!this.providerDetails) this.providerDetails = provider.results[0];
        const attributes = this.providerDetails.attributes;
        attributes.forEach((element) => {
          this.providerDetails[element.attributeType.display] = {
            value: element.value,
            uuid: element.uuid,
          };
        });
        this.setSpiner = false;
      });
  }

  onEdit() {
    this.dialog.open(EditDetailsComponent, {
      width: "400px",
      data: this.providerDetails,
    });
  }

  saveName(value) {
    const URL = `${this.baseURL}/person/${this.providerDetails.person.uuid}`;
    const json = {
      names: value,
    };
    this.http.post(URL, json).subscribe((response) => {});
  }

  saveAddress(value) {
    // tslint:disable-next-line: max-line-length
    // const URL = `${this.baseURL}/provider/${this.providerDetails.uuid}/attribute/${this.providerUpdate.address}`;
    // const json = {
    // 'attributeType': 'eb410260-4f26-4477-85fe-1bdfe3d3dad2',
    // 'value': value
    // };
    // this.http.post(URL, json)
    // .subscribe(response => console.log(response));
  }

  signature() {
    this.dialog.open(SignatureComponent, {
      width: "500px",
      data: { type: "add" },
    });
  }
  get signatureImage() {
    return this.provider.signatureImage;
  }
}
