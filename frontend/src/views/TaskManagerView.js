import Task from '../pages/dashboard/components/Task.js' ;
import CompletedTask from '../pages/dashboard/components/CompletedTask.js';
import TaskListPlaceholder from '../pages/dashboard/components/TaskListPlaceholder.js';
import TaskListLoader from '../pages/dashboard/components/TaskListLoader.js';
import TaskListError from '../pages/dashboard/components/TaskListError.js';
import LoadingCircle from '../components/LoadingCircle.js';
import config from '../config.js';

export default class TaskManagerView {
  constructor(modalHandler, modalView, utils, loadHandler, router, auth, userMenuView) {
    this.modalHandler = modalHandler;
    this.modalView = modalView;
    this.utils = utils;
    this.loadHandler = loadHandler;
    this.router = router;
    this.auth = auth;
    this.userMenuView = userMenuView;
    this.timIds = {};
    this.controllerMethods = {};
    this.smallCircleLoader = LoadingCircle.getHtml('small');
    this.lms = {
      taskManagerLm: document.getElementById('task-manager'),
      addTaskBtn: document.getElementById('task-manager__dashboard-add-btn'),
      addTaskPromptLm: document.getElementById('task-manager__add-prompt'),
      addTaskPromptCloseBtn: document.getElementById('task-manager__add-prompt-close-btn'),
      addTaskPromptFormLm: document.getElementById('task-manager__add-prompt-form'),
      submitTaskBtn: document.getElementById('task-manager__add-prompt-submit-btn'),
      submitTaskBtnTextLm: document.getElementById('task-manager__add-prompt-submit-btn-text'),
      addTaskPromptTitleErrorLm: document.getElementById('task-manager__add-prompt-title-error'),
      addTaskPromptDueDateErrorLm: document.getElementById('task-manager__add-prompt-due-date-error'),
      addTaskPromptDescErrorLm: document.getElementById('task-manager__add-prompt-desc-error'),
      addTaskPromptErrorLm: document.getElementById('task-manager__add-prompt-error'),
      searchTaskPromptLm: document.getElementById('task-manager__search-prompt'),
      searchTaskBtn: document.getElementById('task-manager__dashboard-search-btn'),
      searchTaskInputLm: document.getElementById('task-manager__search-prompt-input'),
      searchTaskDefaultIcon: document.getElementById('task-manager__search-svg'),
      searchTaskCloseIcon: document.getElementById('task-manager__search-prompt-close-btn'),
      clearAllTasksBtn: document.getElementById('task-manager__dashboard-clear-btn'),
      taskListLm: document.getElementById('task-manager__task-list'),
      taskCountLm: document.getElementById('task-manager__dashboard-tasks-count'),
      taskCountErrorLm: document.getElementById('task-manager__dashboard-tasks-count-error'),
      currentDateLm: document.getElementById('task-manager__dashboard-date'),
      sectionHeader: document.getElementById('task-manager__tabs-nav'),
      sectionHeaderTabLms: document.querySelectorAll('.task-manager__tab-btn').length
        ? document.querySelectorAll('.task-manager__tab-btn')
        : document.querySelectorAll('.enhanced-task-manager__tab-btn'),    
      tabListLm: document.getElementById('task-manager__tab-list'),
      scrollToTopBtn: document.getElementById('task-manger__scroll-to-top-btn')
    };
  }

  getDomRefs() {
    return this.lms;
  }

  scrollToTop(behavior = 'smooth', isEnhancedTaskManager) {
    // Check if the user prefers reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: no-preference)').matches;
    // If client prefers reduced motion set scroll behaviour to auto
    if (!prefersReducedMotion) behavior = 'auto';
    // Scroll to the top of the container
    if (isEnhancedTaskManager) {
      this.lms.taskListLm.scrollTo({top: 0, behavior: behavior});
    } 
    else {
      this.lms.taskManagerLm.scrollTo({top: 0, behavior: behavior});
    }
  }

  isSectionHeaderSticky() {
    // Get the sticky element's bounding rect relative to the viewport
    const stickyRect = this.lms.sectionHeader.getBoundingClientRect();
    // Get the container's bounding rect
    const containerRect = this.lms.taskManagerLm.getBoundingClientRect();
    // Calculate the top offset of the sticky element relative to the container
    const stickyOffset = stickyRect.top - containerRect.top;
    
    return stickyOffset <= 0;
  }

  toggleScrollToTopBtn() {
    this.lms.scrollToTopBtn.classList.toggle('show', this.isSectionHeaderSticky());
  }

  getCurrentSearchValue() {
    return this.lms.searchTaskInputLm.value.trim();
  }

  setControllerMethods(methods) {
    Object.keys(methods).forEach(key => {
      this.controllerMethods[key] = methods[key];
    });
  }

  toggleActiveBtn(btnLm) {
    if (btnLm.getAttribute('aria-expanded') === 'false') {
      // Show active state
      btnLm.classList.add('active');
      btnLm.setAttribute('aria-expanded', true);
    } 
    else {  
      // Remove active state
      btnLm.classList.add('transition-disabled'); // Reset transition to avoid showing a laggy animation
      btnLm.classList.remove('active');
      btnLm.setAttribute('aria-expanded', false);
      // Needs a small timeout to let the browser calculate the changes
      setTimeout(() => {
        btnLm.classList.remove('transition-disabled')
      });
    }
  }

  showPrompt(promptLm, btnLm, firstFocusableLm, hidePromptTimId, timeout) {
    this.router.abortActiveFetches();
    clearTimeout(hidePromptTimId);

    promptLm.removeAttribute('hidden');
    this.toggleActiveBtn(btnLm);

    setTimeout(() => {
      promptLm.classList.add('active');
    }, 20);

    const focusFirstPromptLmTimId = setTimeout(() => {
      this.modalHandler.addFocus({
        firstFocusableLm: firstFocusableLm,
        auto: false
      });
    }, timeout);

    this.router.setActiveTimeout('focusFirstPromptLm', focusFirstPromptLmTimId);
    this.timIds.focusFirstPromptLm = focusFirstPromptLmTimId;
  }

  hidePrompt(promptLm, btnLm, focusFirstPromptLmTimId, hidePromptKey, timeout, returnFocus) {
    clearTimeout(focusFirstPromptLmTimId);

    if (returnFocus) {
      this.modalHandler.restoreFocus({
        lastFocusedLm: btnLm,
        auto: false
      });
    }
    this.toggleActiveBtn(btnLm);
    promptLm.classList.remove('active');
    
    const hidePromptTimId = setTimeout(() => {
      promptLm.setAttribute('hidden', '');
    }, timeout);    

    this.router.setActiveTimeout('hidePrompt', hidePromptTimId);
    this.timIds[hidePromptKey] = hidePromptTimId;
  }

  openAddTaskPrompt() {
    this.showPrompt(
      this.lms.addTaskPromptLm,
      this.lms.addTaskBtn,
      this.lms.addTaskPromptCloseBtn,
      this.timIds.hideAddTaskPrompt,
      250
    );

    // Add event listeners
    this.modalHandler.addA11yEvents({
      modalKey: 'addTaskPrompt',
      modalLm: this.lms.addTaskPromptLm,
      modalLmOuterLimits: this.lms.taskManagerLm,
      closeLms: [ this.lms.addTaskPromptCloseBtn ],
      exemptLms: [ this.userMenuView.lms.userMenuBtn ],
      closeHandler: this.confirmDiscardPromptData.bind(this)
    });
  }

  closeAddTaskPrompt(returnFocus = true) {
    // In case user closes prompt with a pending fetch request and is logged in, manages edge case
    if (this.auth.isClientLogged()) {
      this.router.abortActiveFetch('POST=>' + config.apiUrl + '/tasks');
      this.updateAddTaskPromptSubmitBtn('Add new task');
    }
    this.clearAddTaskPromptErrors();

    this.hidePrompt(
      this.lms.addTaskPromptLm,
      this.lms.addTaskBtn,
      this.timIds.focusFirstPromptLm,
      'hideAddTaskPrompt',
      1500,
      returnFocus
    );

    // Remove event listeners
    this.modalHandler.removeA11yEvents({ modalKey: 'addTaskPrompt' });
  }

  openSearchTaskPrompt() {
    this.showPrompt(
      this.lms.searchTaskPromptLm,
      this.lms.searchTaskBtn,
      this.lms.searchTaskInputLm,
      this.timIds.hideSearchTaskPrompt,
      1250
    );

    // Add event listeners
    this.modalHandler.addA11yEvents({
      modalKey: 'searchTaskPrompt',
      closeHandler: this.closeSearchTaskPrompt.bind(this),
      modalLmOuterLimits: this.lms.taskManagerLm,
      exemptLms: [ this.userMenuView.lms.userMenuBtn ]
    });
  }

  toggleClearSearchIcon(searchValue) {
    if (searchValue === '') {
      // If input is empty, show the default search icon and hide the close icon
      this.lms.searchTaskCloseIcon.classList.remove('active');
      this.lms.searchTaskDefaultIcon.classList.remove('active');
    } 
    else {
      // If input has text, show the close icon and hide the default search icon
      this.lms.searchTaskCloseIcon.classList.add('active');
      this.lms.searchTaskDefaultIcon.classList.add('active');
    }
  }

  resetSearchTaskInput(returnFocus) {
    this.lms.searchTaskInputLm.value = '';
    this.toggleClearSearchIcon(this.getCurrentSearchValue());
    this.utils.clearDebounce('searchTask');
    this.controllerMethods.getAllTasks();
    if (returnFocus) {
      this.lms.searchTaskInputLm.focus();
    }
  }

  closeSearchTaskPrompt(returnFocus = true) {
    this.resetSearchTaskInput();

    this.hidePrompt(
      this.lms.searchTaskPromptLm,
      this.lms.searchTaskBtn,
      this.timIds.focusFirstPromptLm,
      'hideSearchTaskPrompt',
      1250,
      returnFocus
    );

    // Remove event listeners
    this.modalHandler.removeA11yEvents({ modalKey: 'searchTaskPrompt' });
  }

  resetAddTaskForm() {
    this.lms.addTaskPromptFormLm.reset();
    this.closeAddTaskPrompt();
  }

  isAddTaskFormEdited() {
    return this.utils.isFormPopulated(this.lms.addTaskPromptFormLm);
  }

  confirmDiscardPromptData() {
    if (this.isAddTaskFormEdited()) {
      this.modalView.openConfirmModal({
        confirmHandler: this.resetAddTaskForm.bind(this),
        modalType: 'confirmDiscardChanges',
        returnFocusAtConfirmHandler: false
      });
    }
    else {
      this.closeAddTaskPrompt();
    }
  }

  renderGeneralAddTaskPromptError(message) {
    this.lms.addTaskPromptErrorLm.classList.add('active');
    this.lms.addTaskPromptErrorLm.innerText = message;
  }

  clearGeneralAddTaskPromptError() {
    this.lms.addTaskPromptErrorLm.innerText = '';
    this.lms.addTaskPromptErrorLm.classList.remove('active');
  }

  renderAddTaskPromptErrors(errors) {
    this.utils.renderFormErrors(errors, {
      title: this.lms.addTaskPromptTitleErrorLm,
      due_date: this.lms.addTaskPromptDueDateErrorLm,
      description: this.lms.addTaskPromptDescErrorLm
    });
  }

  clearAddTaskPromptErrors() {
    this.utils.clearFormErrors([
      this.lms.addTaskPromptTitleErrorLm,
      this.lms.addTaskPromptDueDateErrorLm,
      this.lms.addTaskPromptDescErrorLm,
      this.lms.addTaskPromptErrorLm
    ]);
  }

  updateAddTaskPromptSubmitBtn(text) {
    this.utils.updateSubmitBtn(text, this.lms.submitTaskBtnTextLm);
  }

  setDefaultTaskManagerFocus(isEnhancedTaskManager) {
    if (!isEnhancedTaskManager) {
      this.focusAddTaskBtn();
    } 
    else {
      this.focusSearchTaskBtn();
    }
  }

  focusAddTaskBtn() {
    this.lms.addTaskBtn.focus();
  }

  focusSearchTaskBtn() {
    this.lms.searchTaskBtn.focus();
  }

  updateCurrentDashboardDate() {
    const currentDate = new Date();
    
    this.lms.currentDateLm.innerText = this.utils.formatDate(currentDate).longFormat;
    this.lms.currentDateLm.setAttribute('datetime', this.utils.formatDate(currentDate).isoFormat);
  }

  renderTasksListLoader(isEnhancedTaskManager) {
    this.lms.taskListLm.innerHTML = TaskListLoader.getHtml({ isEnhacedTaskView: isEnhancedTaskManager });
  }

  renderTasksListError(error) {
    this.lms.taskListLm.innerHTML = TaskListError.getHtml(error);
  }

  renderTasks(taskData, isEnhancedTaskManager) {
    if (taskData.length === 0) {
      this.lms.taskListLm.innerHTML = this.getCurrentSearchValue() 
        ? TaskListPlaceholder.getHtml({ search: true, isEnhacedTaskView: isEnhancedTaskManager }) 
        : TaskListPlaceholder.getHtml({ isEnhacedTaskView: isEnhancedTaskManager })

      this.loadHandler.blurLoadImages();
      return;
    }

    const sortedTasks = taskData.sort((a, b) => {
      // If both are completed, keep their order
      if (a.is_completed && b.is_completed) return 0;
      
      // If one is completed, move it down
      if (a.is_completed) return 1;
      if (b.is_completed) return -1;
  
      // Sort by due_date (ascending)
      return new Date(a.due_date) - new Date(b.due_date);
    });

    this.lms.taskListLm.innerHTML = sortedTasks
      .map(task => task.is_completed 
        ? CompletedTask.getHtml(task, this.getCurrentSearchValue()) 
        : Task.getHtml(task, this.getCurrentSearchValue()))
      .join('');
  }

  updateTaskCount(text) {
    if (text === 'loader') {
      this.lms.taskCountLm.innerHTML = this.smallCircleLoader;
    }
    else {
      this.lms.taskCountLm.innerText = text;
    }
  }

  renderTaskCount(count) {
    if (count === 0) {
      this.updateTaskCount('No tasks left');
    } 
    else if (count === 1) {
      this.updateTaskCount(count + ' task left');
    } 
    else {
      this.updateTaskCount(count + ' tasks left');
    }
  }

  renderTaskCountError(message) {
    this.lms.taskCountErrorLm.innerText = message;
    this.lms.taskCountErrorLm.classList.add('active');
  }

  clearTaskCountError() {
    this.lms.taskCountErrorLm.innerText = '';
    this.lms.taskCountErrorLm.classList.remove('active');
  }

  setActiveTab(tab) {
    tab.setAttribute('aria-selected', true);
    tab.setAttribute('aria-expanded', true);
    tab.classList.add('active');
    localStorage.setItem('currentActiveTabId', tab.id);
  }

  setInactiveTab(tab) {
    tab.setAttribute('aria-selected', false);
    tab.setAttribute('aria-expanded', false); 
    tab.classList.add('transition-disabled'); // Reset transition to avoid showing a laggy animation
    tab.classList.remove('active');
    // Needs a small timeout to let the browser calculate the changes
    setTimeout(() => {
      tab.classList.remove('transition-disabled');
    });
  }

  toggleActiveTab(currentTab, tabId) {
    this.lms.sectionHeaderTabLms.forEach(tab => {
      if (tabId) {
        // In case we have a stored tab option in local storage at page load
        if (tab.id === tabId) {
          this.setActiveTab(tab);
        }
        return;
      }

      if (tab !== currentTab) {
        this.setInactiveTab(tab);
      } 
      else {
        this.setActiveTab(tab);
      }
    });
  }

  returnFocusToEditTaskBtn(taskId) {
    const editTaskBtn = document.getElementById(`task-manager__edit-task-btn-${taskId}`);
    editTaskBtn ? editTaskBtn.focus() : this.lms.searchTaskInputLm.focus();
  }
}