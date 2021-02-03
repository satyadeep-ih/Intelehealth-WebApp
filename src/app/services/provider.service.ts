import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "src/environments/environment";

@Injectable({
  providedIn: "root",
})
export class ProviderService {
  private baseURL = environment.baseURL;
  public providerDetails = [];
  public signatureProviderObject = null;
  public signAttributeType = "4aae7cb6-fefd-4f74-b2a8-b728c1c9e784";

  constructor(private http: HttpClient) {}

  createProvider(payload) {
    return this.http.post(`${this.baseURL}/provider`, payload);
  }

  deleteProvider(providerUuid) {
    return this.http.delete(
      `${this.baseURL}/provider/${providerUuid}?purge=true`
    );
  }

  get providersAttributes() {
    try {
      let providers = [];
      this.providerDetails.forEach((provider) => {
        const signAttr = provider.attributes.find(
          (p) => p.attributeType.uuid === this.signAttributeType
        );
        if (signAttr) {
          this.signatureProviderObject = provider;
        }
        providers = providers.concat(provider.attributes);
      });
      return providers;
    } catch (error) {
      console.log("providersAttributes", error);
      return [];
    }
  }

  get signatureImage() {
    return this.providersAttributes.find(
      (p) => p.attributeType.uuid === this.signAttributeType
    );
  }
}
