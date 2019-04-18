
import {
  vmWatch,
  vmUnwatch
} from '../viewmodel/notify';
import {
  Component,
  RENDER,
  ROOT_NODES,
  UPDATE,
  STATE,
  STATE_RENDERED
} from '../core/component';
import { 
  setImmediate,
  clearImmediate
} from '../util';
import {
  createTextNode,
  setText,
  createElementWithoutAttrs,
  getParent,
  removeChild,
  appendChild
} from '../dom';
import {
  i18n,
  messenger as i18nMessenger,
  I18N_DATA_CHANGED,
  _t as i18nRender
} from '../core/i18n';

function render() {
  if (this._h) {
    const $c = createElementWithoutAttrs('div');
    $c.innerHTML = this._r();
    this[ROOT_NODES].push(...$c.childNodes);
  } else {
    const el = createTextNode(this._r());
    this[ROOT_NODES].push(el);
  }
  return this[ROOT_NODES];
}

function update() {
  const roots = this[ROOT_NODES];
  if (this._h) {
    const p = getParent(roots[0]);
    if (roots.length > 0) {
      roots.forEach(n => removeChild(p, n));
      roots.length = 0;
    }
    appendChild(p, this[RENDER]());
  } else {
    setText(roots[0], this._r());
  }
}

function updateLater() {
  if (this[STATE] !== STATE_RENDERED) return;
  if (this._i) clearImmediate(this._i);
  this._i = setImmediate(() => {
    this._i = null;
    this[UPDATE]();
  });
}

const I18nComponentsCache = new Map();
export class I18nComponent extends Component {
  static prefix(prefix, cache = true) {
    let C = I18nComponentsCache.get(prefix);
    if (C) return C;
    C = new Function('BaseI18n', `
    return class I18n_${prefix.replace(/\./g, '_')} extends BaseI18n {
      constructor(attrs) {
        const vm = super(attrs);
        this._f = '${prefix}';
        return vm;
      }
    }`)(I18nComponent);
    if (cache) {
      I18nComponentsCache.set(prefix, C);
    }
    return C;
  }
  constructor(attrs) {
    if (!attrs.key) throw new Error('I18n component require attribute "key". see https://todo');
    super(attrs);
    this.key = attrs.key;
    this.p = attrs.params;
    this._h = !!attrs._html; // render html mode
    this._f = ''; // prefix

    this._i = null;  // update immediate
    this._ub = updateLater.bind(this);
    vmWatch(this, 'p.**', this._ub);
    i18nMessenger.on(I18N_DATA_CHANGED, this._ub);
  }
  beforeDestroy() {
    vmUnwatch(this, 'p.**', this._ub);
    i18nMessenger.off(I18N_DATA_CHANGED, this._ub);
  }
  get key() {
    return this._k;
  }
  set key(v) {
    if (this._k === v) return;
    this._k = v;
    updateLater.call(this);
  }
  /**
   * render text
   */
  _r() {
    return i18n((this._f ? `${this._f}.` : '') + this._k, this.p);
  }
  [RENDER]() {
    return render.call(this);
  }
  [UPDATE]() {
    update.call(this);
  }
}

export class _TComponent extends Component {
  constructor(attrs) {
    super(attrs);
    this.p = attrs.params;
    this._t = attrs._text;
    this._h = !!attrs._html; // render html mode
    this._i = null;  // update immediate
    vmWatch(this, 'p.**', updateLater.bind(this));
  }
  beforeDestroy() {
    vmUnwatch(this, 'p.**');
  }
  _r() {
    return i18nRender(this._t, this.p);
  }
  [RENDER]() {
    return render.call(this);
  }
  [UPDATE]() {
    update.call(this);
  }
}