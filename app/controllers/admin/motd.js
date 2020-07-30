import Controller from '@ember/controller';
import EmberObject, {action} from '@ember/object';
import {tracked} from '@glimmer/tracking';

export default class AdminMotdController extends Controller {
  @tracked entry;
  @tracked query;

  queryParams = ['audience', 'type', 'sort', 'page', 'page_size'];

  typeOptions = [
    [ 'All', 'all' ] ,
    [ 'Expired', 'expired' ],
    [ 'Active', 'active' ],
  ];

  sortOptions = [
    ['Descending', 'desc'],
    ['Ascending', 'asc']
  ];

  audienceOptions = [
    'all',
    'rangers',
    [ 'prospectives/alphas', 'pnvs' ],
    'auditors'
  ];

  @action
  newEntry() {
    this.entry = this.store.createRecord('motd');
  }

  @action
  cancelEntry() {
    this.entry = null;
  }

  @action
  editEntry(motd) {
    this.entry = motd;
  }

  @action
  saveEntry(model, isValid) {
    if (!isValid) {
      return;
    }
    const isNew = this.entry.isNew;

    if (!model.get('for_pnvs') && !model.get('for_auditors') && !model.get('for_rangers')) {
      this.modal.info(null, 'Check one or more audiences to show the message to.');
      return;
    }

    model.save().then(() => {
      this.toast.success(`MOTD was successfully ${isNew ? 'created' : 'updated'}.`);
      this.motds.update();
      this.entry = null;
    }).catch((response) => this.house.handleErrorResponse(response, model));
  }

  @action
  deleteEntry() {
    this.modal.confirm('Delete MOTD entry', 'Are you sure?', () => {
      this.entry.destroyRecord()
        .then(() => {
          this.toast.success('MOTD has been removed.');
          this.entry = null;
        })
        .catch((response) => this.house.handleErrorResponse(response));
    })
  }

  @action
  resetFilters() {
    this.query = EmberObject.create({ sort: 'desc', audience: 'pnvs', type: 'all' });
  }

  @action
  searchAction() {
    this.queryParams.forEach((param) => {
      this.set(param, this.query[param] ?? null);
    });
  }

  @action
  goNextPage() {
    this.set('page', +this.currentPage + 1);
  }

  @action
  goPrevPage() {
    this.set('page', +this.currentPage - 1);
  }
}
