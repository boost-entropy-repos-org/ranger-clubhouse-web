import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | ch form/submit', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    this.set('onSubmit', () => { });
    await render(hbs`{{ch-form/submit onSubmit=onSubmit}}`);
    assert.dom('button').exists();
    assert.dom('button').hasAttribute('type', 'submit');
    assert.dom('button').hasText('Save');
  });

  test('it renders with label', async function(assert) {
    this.set('onSubmit', () => { });
    await render(hbs`{{ch-form/submit label="I'm a pickle" onSubmit=onSubmit}}`);
    assert.dom('button').exists();
    assert.dom('button').hasAttribute('type', 'submit');
    assert.dom('button').hasText("I'm a pickle");
  });

});
