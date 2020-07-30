import Controller from '@ember/controller';
import { action, computed, set } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import fade from 'ember-animated/transitions/fade';

const MOTD_LIMIT = 5;

export default class MeOverviewController extends Controller {
  @tracked remainingOffPageMotds = 0;
  @tracked isLoadingMotds = false;

  fadeMotdEffect = fade;

  motdLimit = MOTD_LIMIT;

  @computed('motds.@each.has_read')
  get unreadMotds() {
    return this.motds.filter((m) => !m.has_read).splice(0,MOTD_LIMIT);
  }

  @computed('motds.@each.has_read')
  get unreadMotdTotal() {
    return this.motds.filter((m) => !m.has_read).length;
  }

  @action
  refreshPhoto() {
    this.ajax.request(`person/${this.person.id}/photo`)
         .then((result) => this.set('photo', result.photo));
    // Need to refresh the milestones to pick up the new photo submitted status.
    this.ajax.request(`person/${this.person.id}/milestones`).then((result) => this.set('milestones', result.milestones));
  }

  @action
  showUploadDialogAction() {
    this.set('showUploadDialog', true);
  }

  @action
  closeUploadDialogAction() {
    this.set('showUploadDialog', false);
  }

  @action
  toggleMotd(motd) {
    this.motds.forEach((m) => {
      set(m, 'showing', (motd.id == m.id) ? !motd.showing : false);
    });
  }

  @action
  markMotdAsRead(motd) {
    set(motd, 'isMarking', true);
    this.ajax.request(`motd/${motd.id}/markread`, { method: 'POST'})
      .then(() => {
        set(motd, 'showing', false);
        set(motd, 'has_read', true);
        this.toast.success('Announcement marked as read.');
        const unreadMotds = this.unreadMotds;
        if (unreadMotds.length) {
          const nextMotd = unreadMotds[0];
          set(nextMotd, 'showing', true);
          this.house.scrollToElement(`#motd-${motd.id}`);
        }
      }).catch((response) => this.house.handleErrorResponse(response))
      .finally(() => set(motd, 'isMarking', false));
  }

}
