import Route from '@ember/routing/route';
import requestYear from 'clubhouse/utils/request-year';
import RSVP from 'rsvp';

export default class ReportsRadioCheckoutRoute extends Route {
  queryParams = {
    year: { refreshModel: true },
    include_qualified: { refreshModel: true },
    event_summary: { refreshModel: true },
  };

  model(params) {
    const year = requestYear(params);
    const query = { year };

    console.log('params', params);
    if (this._isSet(params.include_qualified)) {
      query.include_qualified = 1;
      console.log('including QUALIFY');
    }

    if (this._isSet(params.event_summary)) {
      query.event_summary = 1;
    }

    return RSVP.hash({
      radios: this.ajax.request('asset-person/radio-checkout-report', {
        data: query
      }).then((results) => results.radios),
      year,
      include_qualified: query.include_qualified ? 1 : 0,
      event_summary: query.event_summary ? 1 : 0,
    });
  }

  setupController(controller, model) {
    super.setupController(...arguments);
    controller.setProperties(model);
  }

  resetController(controller, isExiting) {
    if (isExiting) {
      controller.set('year', null);
      controller.set('include_qualified', false);
      controller.set('event_summary', false);
    }
  }

  _isSet(value) {
    return (parseInt(value) || value == 'true');
  }

  resetController(controller, isExiting) {
    if (isExiting) {
      controller.set('year', null);
    }
  }
}
