import Controller from '@ember/controller';
import { action,set } from '@ember/object';
import { tracked } from '@glimmer/tracking';

/*
 * Confirm a person's entire timesheet correct/incorrect.
 */

export default class MeTimesheetCorrectionsConfirmController extends Controller {
  @tracked isSubmitting = false;
  @tracked confirmForm = null; // setup in the route

  get unverifiedCount() {
    return this.timesheets.reduce((total, ts) => total+(ts.isUnverified ? 1 : 0), 0);
  }

  get correctionPendingReviewCount() {
    return this.timesheets.reduce((total, ts) => total+(ts.isPending ? 1 : 0), 0);
  }

  get missingPendingReviewCount() {
    return this.timesheetsMissing.reduce((total, ts) => total+(ts.isPending ? 1 : 0), 0);
  }

  @action
  confirmAction(model) {
    const confirmed = model.confirm ? 1 : 0;
    const person_id = this.session.userId;

    if (!confirmed) {
      this.modal.info(null, 'You need to mark the checkbox to indicate your timesheet is accurate and does not require additional corrections.');
      return;
    }

    this.isSubmitting = true;

    this.ajax.request(`timesheet/confirm`, {
      method: 'POST',
      data: { person_id, confirmed }
    }).then((result) => {
      const ci = result.confirm_info;
      // Update the confirmed results
      set(this, 'timesheetInfo.timesheet_confirmed', ci.timesheet_confirmed);
      set(this, 'timesheetInfo.timesheet_confirmed_at', ci.timesheet_confirmed_at);
      this.toast.success(`Your timesheet has been marked as ${ci.timesheet_confirmed ? 'CONFIRMED' : 'UNCONFIRMED'}.`);
      this.transitionToRoute('me.timesheet-corrections.index');
    }).catch((response) => this.house.handleErrorResponse(response))
    .finally(() => this.isSubmitting = false);
  }
}
