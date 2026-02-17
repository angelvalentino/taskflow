export default class Router {
  constructor(modalHandler) {
    if (Router.instance) return Router.instance; // Prevents multiple instances
    this.routes = [];
    this.init();
    this.appLm = document.getElementById('App');
    this.abortControllers = {};
    this.intervalIds = {};
    this.timeoutIds = {};
    this.modalHandler = modalHandler;
    Router.instance = this; // Store the instance
  }

  setNewAbortSignal(fetchKey) {
    this.abortControllers[fetchKey] = new AbortController();
  }

  setActiveInterval(key, intId) {
    this.intervalIds[key] = intId;
  }

  setActiveTimeout(key, timId) {
    this.timeoutIds[key] = timId;
  }

  getAbortSignal(fetchKey) {
    this.setNewAbortSignal(fetchKey);
    return this.abortControllers[fetchKey].signal;
  }

  getActiveTimeoutId(key) {
    return this.timeoutIds[key];
  }

  getActiveIntervalId(key) {
    return this.intervalIds[key];
  }

  // Adds a route
  addRoute(path, view) {
    this.routes.push({ path, view });
  }

  // Initializes the router and checks for matching route
  init() {
    window.addEventListener('popstate', () => this.dispatch());  // Listen for back/forward navigation
    this.setupLinkNavigation();
  }

  // Route matching and rendering logic
  dispatch() {
    const formerView = this.appLm.dataset.view

    let matchedRoute = this.routes.find(route => location.pathname === route.path);
    
    if (!matchedRoute) {
      matchedRoute = this.routes.find(route => route.path === '*');
    }

    if (!matchedRoute) {
      console.error('Routing error: No matching route found, and no 404 route is defined.');
      return;
    }

    // Update current view
    this.appLm.dataset.view = matchedRoute.path;
    const currentView = this.appLm.dataset.view;

    // Avoid rendering the same view
    if (formerView === currentView) {
      return;
    };
   
    if (document.body.classList.length != 0) document.body.className = '';

    this.modalHandler.reset();
    this.abortActiveFetches();
    this.clearActiveIntervals();
    this.clearActiveTimeouts();
  
    matchedRoute.view();
    window.scrollTo({ top: 0, behavior: 'auto'});
  }

  // Utility method to navigate to a new URL
  navigateTo(url) {
    history.pushState(null, null, url);
    this.dispatch();
  }

  // Set up event listener for links with the 'data-link' attribute
  setupLinkNavigation() {
    document.body.addEventListener('click', e => {
      const link = e.target.closest('[data-link]');
      
      if (link) {
        e.preventDefault();
        e.stopPropagation();
        this.navigateTo(link.href);
      }
    });
  }

  abortActiveFetch(key) {
    if (this.abortControllers[key] && !this.abortControllers[key].aborted) {
      this.abortControllers[key].abort();
    }
  }

  abortActiveFetches() {
    Object.values(this.abortControllers).forEach(controller => {
      if (!controller.signal.aborted) {
        controller.abort();
      }
    });
  }

  clearActiveTimeouts() {
    for (const key in this.timeoutIds) {
      clearTimeout(this.timeoutIds[key]);
      delete this.timeoutIds[key];
    }
  }

  clearActiveIntervals() {
    for (const key in this.intervalIds) {
      clearInterval(this.intervalIds[key]);
      delete this.intervalIds[key];
    }
  }
}
