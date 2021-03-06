import {tracked, cached} from '@glimmer/tracking';
import { DELIVERY_NONE } from 'clubhouse/models/access-document-delivery';

export default class TicketPackage {
  @tracked wapso; // WAP-SOs will change in length based on how the user's ticketing decisions.

  constructor(pkg, person_id, house) {
    const docs = pkg.access_documents.map((ad) => house.pushPayload('access-document', ad));

    this.accessDocuments = docs;
    this.tickets = docs.filter((d) => d.isTicket);
    this.vehiclePass = docs.find((d) => d.isVehiclePass);
    if (pkg.delivery) {
      this.delivery = house.pushPayload('access-document-delivery', pkg.delivery);
    } else {
      this.delivery = house.store.createRecord('access-document-delivery', {person_id, year: house.currentYear(), method: DELIVERY_NONE });
    }
    this.wap = docs.find((d) => d.isWAP);
    this.wapso = docs.filter((d) => d.isWAPSO);
    this.appreciations = docs.filter((d) => d.isAppreciation).sort((a, b) => a.typeHuman.localeCompare(b.typeHuman));

    this.year_earned = pkg.year_earned;
    this.credits_earned = pkg.credits_earned;
  }

  /**
   * Find the ticket
   *
   * - For multiple tickets on file, find the one that has been claimed
   * ( <TicketInfo> will deal with multiples, all other ticketing components want a single ticket)
   * - Otherwise use the single ticket if it exists
   *
   * @returns {AccessDocumentModel|null}
   */

  @cached
  get ticket() {
    const {tickets} = this;

    if (tickets.length > 1) {
      return tickets.find((t) => t.isUsing);
    } else if (tickets.length === 1) {
      return tickets[0];
    } else {
      return null;
    }
  }

  /**
   * Has a ticket been claimed?
   * @returns {boolean}
   */

  get ticketClaimed() {
    return !!(this.ticket && this.ticket.isUsing);
  }

  /**
   * Has an address been entered?
   * @returns {boolean}
   */

  get haveAddress() {
    const {ticket, vehiclePass, delivery} = this;

    // Staff Credentials are Will-Call items and do not require an address
    if (ticket && ticket.isClaimed && ticket.isStaffCredential) {
      return true;
    }

    const item = ticket ?? vehiclePass;
    if (item && item.isClaimed) {
      return delivery.isDeliveryWillCall || (delivery.isDeliveryMail && delivery.haveAddress);
    }

    // Nothing claimed yet, or not needing address
    return true;
  }
}

