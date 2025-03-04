
import { CompanyProfileController } from "./company-profile-controller.ts";
import { MarketCapController } from "./market-cap-controller.ts";
import { CompanyManagementController } from "./company-management-controller.ts";
import { PeersController } from "./peers-controller.ts";
import { BaseProfileController } from "./base-profile-controller.ts";

/**
 * Main profile controller that acts as a facade to specialized controllers
 */
export class ProfileController extends BaseProfileController {
  private companyProfileController: CompanyProfileController;
  private marketCapController: MarketCapController;
  private companyManagementController: CompanyManagementController;
  private peersController: PeersController;

  constructor() {
    super();
    this.companyProfileController = new CompanyProfileController();
    this.marketCapController = new MarketCapController();
    this.companyManagementController = new CompanyManagementController();
    this.peersController = new PeersController();
  }

  /**
   * Handle requests for company profile data
   */
  async handleRequest(endpoint: string, symbol: string): Promise<any> {
    switch (endpoint) {
      case "profile":
        return await this.companyProfileController.fetchProfile(symbol);
      case "quote":
        return await this.companyProfileController.fetchQuote(symbol);
      case "rating":
        return await this.companyProfileController.fetchRating(symbol);
      case "peers":
        return await this.peersController.fetchPeers(symbol);
      case "market-cap":
        return await this.marketCapController.fetchMarketCap(symbol);
      case "historical-market-cap":
        return await this.marketCapController.fetchHistoricalMarketCap(symbol);
      case "shares-float":
        return await this.marketCapController.fetchSharesFloat(symbol);
      case "executives":
        return await this.companyManagementController.fetchExecutives(symbol);
      case "executive-compensation":
        return await this.companyManagementController.fetchExecutiveCompensation(symbol);
      case "company-notes":
        return await this.companyManagementController.fetchCompanyNotes(symbol);
      case "employee-count":
        return await this.companyManagementController.fetchEmployeeCount(symbol);
      case "historical-employee-count":
        return await this.companyManagementController.fetchHistoricalEmployeeCount(symbol);
      default:
        throw new Error(`Unsupported profile endpoint: ${endpoint}`);
    }
  }
}
