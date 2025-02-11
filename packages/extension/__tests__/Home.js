import { mount, createLocalVue, config } from '@vue/test-utils';
import Vuex from 'vuex';
import icons from '@daily/components/src/icons';
import tooltip from '@daily/components/src/directives/tooltip';
import DaSearch from '@daily/components/src/components/DaSearch.vue';
import DaHome from '../src/routes/Home.vue';
import DaContext from '../../components/src/components/DaContext.vue';
import DaHeader from '../src/components/DaHeader.vue';
import DaSidebar from '../src/components/DaSidebar.vue';
import DaFeed from '../src/components/DaFeed.vue';
import { createDummyEvent } from './fixtures/helpers';

config.stubs['transition'] = true;

const localVue = createLocalVue();

localVue.use(Vuex);
localVue.use(icons);
localVue.directive('tooltip', tooltip(localVue));
localVue.component('da-search', DaSearch);
localVue.component('da-context', DaContext);
localVue.component('da-header', DaHeader);
localVue.component('da-sidebar', DaSidebar);
localVue.component('da-feed', DaFeed);
localVue.filter('provider', value => value);

let feed;
let ui;
let user;
let store;

beforeEach(() => {
  window.ga = () => {
  };

  feed = {
    namespaced: true,
    state: {
      publications: [],
      posts: [],
      showBookmarks: false,
      filter: null,
    },
    mutations: {
      setPublications: jest.fn(),
      setDaFeedReference: jest.fn(),
    },
    actions: {
      search: jest.fn(),
    },
    getters: {
      feed: state => state.posts,
      showAd: jest.fn(),
      emptyFeed: () => false,
      hasConflicts: () => false,
      hasFilter: () => false,
    },
  };

  ui = {
    namespaced: true,
    state: {
      insaneMode: false,
      showDndMenu: false,
    },
    mutations: {
      setDndModeTime: jest.fn(),
      setShowDndMenu: jest.fn(),
    },
    getters: {
      topSitesInstructions: jest.fn(),
      sidebarInstructions: jest.fn(),
      showReadyModal: jest.fn(),
      dndMode: jest.fn(),
      dndModeTime: jest.fn(),
    },
  };

  user = {
    namespaced: true,
    state: {
      profile: null,
    },
    getters: {
      isLoggedIn: state => !!state.profile,
    },
  };

  store = new Vuex.Store({
    modules: { feed, ui, user },
  });

  window.requestIdleCallback = jest.fn();
  window.IntersectionObserver = jest.fn();
});

it('should commit "setDndModeTime" when "For 1 Hour" or "Until Tomorrow" is clicked', () => {
  const wrapper = mount(DaHome, { store, localVue });
  wrapper.find('.dnd-context .btn-menu').trigger('click');
  expect(ui.mutations.setDndModeTime).toBeCalledWith(expect.anything(), expect.any(Number));
});

it('should close context menu when clicking two times on the DnD button', (done) => {
  const wrapper = mount(DaHome, { store, localVue });
  const header = wrapper.find('header');
  header.vm.$emit('menu', createDummyEvent(header.element));
  setTimeout(() => {
    expect(wrapper.vm.$refs.dndContext.$refs.context.show).toEqual(true);
    ui.state.showDndMenu = true;
    header.vm.$emit('menu', createDummyEvent(header.element));
    setTimeout(() => {
      expect(wrapper.vm.$refs.dndContext.$refs.context.show).toEqual(false);
      done();
    });
  }, 10);
});

it('should open search bar when clicking on the button', () => {
  const wrapper = mount(DaHome, { store, localVue });
  expect(wrapper.find('.content__header .search').element).toBeUndefined();
  wrapper.find('.search-btn').trigger('click');
  expect(wrapper.find('.content__header .search').element).toBeTruthy();
});

it('should close search bar when switching to bookmarks', () => {
  const wrapper = mount(DaHome, { store, localVue });
  wrapper.find('.search-btn').trigger('click');
  expect(wrapper.find('.content__header .search').element).toBeTruthy();
  feed.state.showBookmarks = true;
  expect(wrapper.find('.content__header .search').element).toBeUndefined();
});

it('should close search bar when setting filter', () => {
  const wrapper = mount(DaHome, { store, localVue });
  wrapper.find('.search-btn').trigger('click');
  expect(wrapper.find('.content__header .search').element).toBeTruthy();
  feed.state.filter = { type: 'publication', info: { id: 'angular', name: 'Angular' } };
  expect(wrapper.find('.content__header .search').element).toBeUndefined();
});

it('should search query', () => {
  const wrapper = mount(DaHome, { store, localVue });
  wrapper.find('.search-btn').trigger('click');
  wrapper.find('.content__header .search').vm.$emit('submit', 'hello');
  expect(feed.actions.search).toBeCalledWith(expect.anything(), 'hello');
});

it('should show banner when data is available', (done) => {
  const wrapper = mount(DaHome, { store, localVue });
  wrapper.setData({
    banner: {
      timestamp: new Date(0),
      cta: 'Click here',
      subtitle: 'Sub',
      theme: 'gradient-bacon-onion',
      title: 'Title',
      url: 'https://daily.dev',
    },
  });
  setTimeout(() => {
    expect(wrapper.find('.banner')).toMatchSnapshot();
    done();
  });
});
