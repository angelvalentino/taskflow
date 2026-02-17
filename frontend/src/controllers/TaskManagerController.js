export default class TaskManagerController {
  constructor(taskManagerView, taskModel, auth, modalView, utils, isEnhancedTaskManager = false) {
    this.taskManagerView = taskManagerView;
    this.taskModel = taskModel;
    this.auth = auth;
    this.modalView = modalView;
    this.utils = utils;
    this.activeRequests = {};
    this.isEnhancedTaskManager = isEnhancedTaskManager;

    this.lms = this.taskManagerView.getDomRefs();
    this.taskManagerView.setControllerMethods({
      getAllTasks: this.getAllTasks.bind(this)
    });
  }

  init() {
    if (!this.isEnhancedTaskManager) {
      this.taskManagerView.updateCurrentDashboardDate();

      this.lms.addTaskPromptFormLm.addEventListener('submit', this.submitTask.bind(this));
      this.lms.addTaskBtn.addEventListener('click', this.toggleAddTaskPrompt.bind(this));
      this.lms.taskManagerLm.addEventListener('scroll', this.taskManagerView.toggleScrollToTopBtn.bind(this.taskManagerView));
    }

    this.taskManagerView.toggleActiveTab(null, localStorage.getItem('currentActiveTabId') || 'task-manger__all-tasks-tab-btn');
    this.getAllTasks();
    this.getActiveTasksCount();

    this.lms.searchTaskInputLm.addEventListener(
      'input', 
      this.auth.isClientLogged() 
        ? this.utils.debounce(this.searchTask.bind(this), 500, 'searchTask')
        : this.searchTask.bind(this)
    );
    this.lms.searchTaskBtn.addEventListener('click', this.toggleSearchTaskPrompt.bind(this));
    this.lms.searchTaskCloseIcon.addEventListener('click', this.taskManagerView.resetSearchTaskInput.bind(this.taskManagerView, true));
    this.lms.clearAllTasksBtn.addEventListener('click', this.handleClearAllTasks.bind(this));
    this.lms.taskListLm.addEventListener('click', this.handleTaskAction.bind(this));
    this.lms.tabListLm.addEventListener('click', this.handleSwitchTab.bind(this));
    this.lms.scrollToTopBtn.addEventListener('click', this.handleScrollToTop.bind(this));
  }

  handleScrollToTop() {
    this.taskManagerView.scrollToTop('smooth', this.isEnhancedTaskManager);
  }

  searchTask(e) {
    const targetValue = e.target.value.trim();
    this.getAllTasks();
    this.taskManagerView.toggleClearSearchIcon(targetValue);
  }

  submitTask(e) {
    e.preventDefault();
    const taskData = this.utils.getFormData(
      e.target, 
      (value, key) => key === 'description' && value === '' 
        ? null 
        : typeof value === 'string' 
          ? value.trim() 
          : value
    );

    if (parseInt(localStorage.getItem('taskCount')) >= 100) {
      this.modalView.openInfoModal({
        confirmHandler: this.taskManagerView.resetAddTaskForm.bind(this.taskManagerView),
        modalType: 'infoMaxTasks',
        returnFocus: false
      });
      return;
    }

    // Handle task submission for anonymous users
    if (!this.auth.isClientLogged()) {
      const errors = this.getValidationErrors(taskData);

      if (Object.values(errors).some(val => val !== null)) {
        this.taskManagerView.renderAddTaskPromptErrors(errors);
        return;
      }
  
      this.taskModel.addTaskToLocalStorage(taskData);
      this.taskManagerView.resetAddTaskForm();
      this.getActiveTasksCount();
      this.getAllTasks();
      return;
    }

    // Handle task submission for authenticated users
    if (this.activeRequests.submitTask) {
      this.taskManagerView.renderGeneralAddTaskPromptError('Your request is being processed. Please wait a moment.');
      return
    }
    this.activeRequests.submitTask = true;

    const loadingTimId = this.utils.handleLoading(
      this.taskManagerView.updateAddTaskPromptSubmitBtn.bind(this.taskManagerView, 'Loading')
    );

    this.taskModel.handleSubmitTask(JSON.stringify(taskData))
      .then(() => {
        this.taskManagerView.resetAddTaskForm();
        this.getAllTasks();
        this.getActiveTasksCount();
      })
      .catch(error => {
        if (error.name === 'AbortError') {
          return;
        }

        if (error.data) {
          this.taskManagerView.clearGeneralAddTaskPromptError();
          this.taskManagerView.renderAddTaskPromptErrors(error.data.errors);
        } 
        else {
          this.taskManagerView.clearAddTaskPromptErrors();
          this.taskManagerView.renderGeneralAddTaskPromptError(error.message);
        }
        
        console.error(this.utils.formatErrorMessage(error));
      })
      .finally(() => {
        this.activeRequests.submitTask = false;
        clearTimeout(loadingTimId);
        this.taskManagerView.updateAddTaskPromptSubmitBtn('Add new task');
      });
  }

  getAllTasks(returnFocusHandler) {
    // Handle task render for anonymous users
    if (!this.auth.isClientLogged()) {
      const tasks = this.taskModel.getTasksFromLocalStorage(
        this.utils.getActiveTabFilterParam(), 
        this.taskManagerView.getCurrentSearchValue()
      );
      this.taskManagerView.renderTasks(tasks, this.isEnhancedTaskManager);
      return;
    }

    // Handle task render for authenticated users
    const loadingTimId = this.utils.handleLoading(
      this.taskManagerView.renderTasksListLoader.bind(this.taskManagerView, this.isEnhancedTaskManager)
    );

    this.taskModel.handleGetAllTasks(
      this.utils.getActiveTabFilterParam(), 
      this.taskManagerView.getCurrentSearchValue()
    )
      .then(data => {
        this.taskManagerView.renderTasks(data, this.isEnhancedTaskManager);
        if (returnFocusHandler) returnFocusHandler();
      })
      .catch(error => {
        if (error.name === 'AbortError') {
          return;
        }

        this.taskManagerView.renderTasksListError(error.message);
        console.error(this.utils.formatErrorMessage(error));
      })
      .finally(() => {
        clearTimeout(loadingTimId);
      });
  }

  getActiveTasksCount() {
    // Handle task count for anonymous users
    if (!this.auth.isClientLogged()) {
      const count = this.taskModel.getTaskCountFromLocalStorage(false);
      localStorage.setItem('taskCount', count);
      this.taskManagerView.renderTaskCount(count);
      return;
    }

    // Handle task count for authenticated users
    const loadingTimId = this.utils.handleLoading(
      this.taskManagerView.updateTaskCount.bind(this.taskManagerView, 'loader')
    );
    
    this.taskModel.handleGetAllTasksCount(false, this.isEnhancedTaskManager)
      .then(count => {
        localStorage.setItem('taskCount', count);
        this.taskManagerView.renderTaskCount(count);
        this.taskManagerView.clearTaskCountError();
      })
      .catch(error => {
        if (error.name === 'AbortError') {
          return;
        }

        this.taskManagerView.updateTaskCount('');
        this.taskManagerView.renderTaskCountError(error.message);
        
        console.error(this.utils.formatErrorMessage(error));
      })
      .finally(() => {
        clearTimeout(loadingTimId);
      });
  }

  deleteTask(taskId, closeConfirmModalHandler) {
    // Handle task deletion for anonymous users
    if (!this.auth.isClientLogged()) {
      this.taskModel.deleteTaskFromLocalStorage(taskId);
      this.getAllTasks();
      this.getActiveTasksCount();
      this.taskManagerView.setDefaultTaskManagerFocus(this.isEnhancedTaskManager);
      return;
    }

    // Handle task deletion for authenticated users
    const loadingTimId = this.utils.handleLoading(
      this.modalView.updateConfirmModalInfoMessage.bind(this.modalView, 'loader')
    );

    this.taskModel.handleDeleteTask(taskId)
      .then(() => {
        this.modalView.updateConfirmModalInfoMessage('Task was successfully deleted.', true);

        const timId = setTimeout(() => {
          closeConfirmModalHandler();
          if (!this.isEnhancedTaskManager) {
            this.taskManagerView.focusAddTaskBtn();
          }
        }, 500);
        this.modalView.timIds.closeConfirmModalAfterFetch = timId;
        
        this.getAllTasks();
        this.getActiveTasksCount();
      })
      .catch(error => {
        if (error.name === 'AbortError') {
          return;
        }

        this.modalView.updateConfirmModalInfoMessage(error.message, false, true);
        console.error(this.utils.formatErrorMessage(error));
      })
      .finally(() => {
        clearTimeout(loadingTimId);
      });
  }

  deleteAllTasks(closeConfirmModalHandler, completed) {
    // Handle all task deletion for anonymous users 
    if (!this.auth.isClientLogged()) {
      this.taskModel.deleteAllTasksFromLocalStorage(completed);
      this.getAllTasks();
      this.getActiveTasksCount();
      return;
    }

    // Handle all task deletion for authenticated users
    const loadingTimId = this.utils.handleLoading(
      this.modalView.updateConfirmModalInfoMessage.bind(this.modalView, 'loader')
    );

    this.taskModel.handleDeleteAllTasks(completed)
      .then(() => {
        this.modalView.updateConfirmModalDeleteMessage(completed);

        const timId = setTimeout(() => {
          closeConfirmModalHandler();
        }, 500);
        this.modalView.timIds.closeConfirmModalAfterFetch = timId;
        
        this.getAllTasks();
        this.getActiveTasksCount();
      })
      .catch(error => {
        if (error.name === 'AbortError') {
          return;
        }

        this.modalView.updateConfirmModalInfoMessage(error.message, false, true);
        console.error(this.utils.formatErrorMessage(error));
      })
      .finally(() => {
        clearTimeout(loadingTimId);
      });
  }

  handleClearAllTasks() {
    if (parseInt(localStorage.getItem('taskCount')) <= 0) {
      this.modalView.openInfoModal({
        confirmHandler: null,
        modalType: 'infoEmptyTaskList'
      });
      return;
    }

    this.modalView.openConfirmModal({
      confirmHandler: this.deleteAllTasks.bind(this),
      isFetch: this.auth.isClientLogged(),
      modalType: 'confirmDeleteAllTasks'
    });
  }

  completeTask(taskId, closeConfirmModalHandler) {
    // Handle task completion for anonymous users  
    if (!this.auth.isClientLogged()) {
      this.taskModel.completeTaskFromLocalStorage(taskId);
      this.getAllTasks();
      this.getActiveTasksCount();
      this.taskManagerView.setDefaultTaskManagerFocus(this.isEnhancedTaskManager);
      return;
    }

    // Handle task completion for authenticated users
    const loadingTimId = this.utils.handleLoading(
      this.modalView.updateConfirmModalInfoMessage.bind(this.modalView, 'loader')
    );

    this.taskModel.handleCompleteTask(taskId)
      .then(() => {
        this.modalView.updateConfirmModalInfoMessage('Task was successfully completed.', true);
        
        const timId = setTimeout(() => {
          closeConfirmModalHandler();
          this.taskManagerView.setDefaultTaskManagerFocus(this.isEnhancedTaskManager);
        }, 500);
        this.modalView.timIds.closeConfirmModalAfterFetch = timId;
        
        this.getAllTasks();
        this.getActiveTasksCount();
      })
      .catch(error => {
        if (error.name === 'AbortError') {
          return;
        }

        this.modalView.updateConfirmModalInfoMessage(error.message, false, true);
        console.error(this.utils.formatErrorMessage(error));
      })
      .finally(() => {
        clearTimeout(loadingTimId);
      });
  }

  editTask(taskId, editedTaskData, closeEditModalHandler) {
    // Handle task editing for anonymous users
    if (!this.auth.isClientLogged()) {
      const errors = this.getValidationErrors(editedTaskData);

      if (Object.values(errors).some(val => val !== null)) {
        this.modalView.renderEditTaskFormErrors(errors);
        return;
      }
  
      this.taskModel.editTaskFromLocalStorage(taskId, editedTaskData);
      closeEditModalHandler();
      this.getAllTasks();
      this.taskManagerView.returnFocusToEditTaskBtn(taskId);
      return;
    }

    // Handle task editing for Authenticated users 
    if (this.activeRequests.editTask) {
      this.modalView.renderGeneralEditTaskFormError('Your request is being processed. Please wait a moment.')
      return;
    }

    this.activeRequests.editTask = true;

    const loadingTimId = this.utils.handleLoading(
      this.modalView.updateEditModalSubmitBtn.bind(this.modalView, 'Loading')
    );

    this.taskModel.handleEditTask(taskId, JSON.stringify(editedTaskData))
      .then(() => {
        closeEditModalHandler();
        this.getAllTasks(this.taskManagerView.returnFocusToEditTaskBtn.bind(this.taskManagerView, taskId));
      })
      .catch(error => {
        if (error.name === 'AbortError') {
          return;
        }

        if (error.data) {
          this.modalView.renderEditTaskFormErrors(error.data.errors);
          this.modalView.clearGeneralEditTaskFormError();
        } 
        else {
          this.modalView.clearEditTaskFormErrors();
          this.modalView.renderGeneralEditTaskFormError(error.message);
        }

        console.error(this.utils.formatErrorMessage(error));
      })
      .finally(() => {
        clearTimeout(loadingTimId);
        this.activeRequests.editTask = false;
        this.modalView.updateEditModalSubmitBtn('Edit task');
      });
  }

  handleTaskAction(e) {
    const completeTaskBtn = e.target.closest('.task-manager__complete-task-btn');
    const editTaskBtn = e.target.closest('.task-manager__edit-task-btn');
    const deleteTaskBtn = e.target.closest('.task-manager__delete-task-btn');

    if (completeTaskBtn) {
      const taskId = this.getTaskId(e);

      this.modalView.openConfirmModal({
        confirmHandler: this.completeTask.bind(this, taskId),
        isFetch: this.auth.isClientLogged(),
        modalType: 'confirmComplete',
        returnFocusAtConfirmHandler: false
      });
    }
    else if (editTaskBtn) {
      const taskId = this.getTaskId(e);
      const taskLm = document.getElementById(e.target.closest('.task-manager__task').id)
      const taskData = {
        title: taskLm.querySelector('.task-manager__task-title').innerText,
        due_date: taskLm.querySelector('.task-manger__task-due-date').getAttribute('datetime'),
        description: taskLm.querySelector('.task-manager__task-desc')?.innerHTML || ''
      };

      this.modalView.openEditModal({
        taskData, 
        editHandler: this.editTask.bind(this, taskId),
        taskId
      });
    }
    else if (deleteTaskBtn) {
      const taskId = this.getTaskId(e);

      this.modalView.openConfirmModal({
        confirmHandler: this.deleteTask.bind(this, taskId),
        isFetch: this.auth.isClientLogged(),
        modalType: 'confirmDeleteTask',
        returnFocusAtConfirmHandler: false
      });
    }
  }

  toggleAddTaskPrompt() {
    // Close the neighboring search task prompt if it is currently active
    if (this.lms.searchTaskPromptLm.classList.contains('active')) {
      this.taskManagerView.closeSearchTaskPrompt(false);
    }

    // Toggle prompt
    if (!this.lms.addTaskPromptLm.classList.contains('active')) {
      this.taskManagerView.openAddTaskPrompt();
    } 
    else {
      this.taskManagerView.confirmDiscardPromptData();
    }
  }

  toggleSearchTaskPrompt() {
    // Close the neighboring add task prompt if it is currently active and we are not in the enhanced task manager view
    if (!this.isEnhancedTaskManager && this.lms.addTaskPromptLm.classList.contains('active')) {
      // If the Add Task form has unsaved data, prompt the user for confirmation
      if (this.utils.isFormPopulated(this.lms.addTaskPromptFormLm)) {
        this.taskManagerView.confirmDiscardPromptData();
        return;
      } 

      // Otherwise, close the Add Task prompt without confirmation and without returning focus
      this.taskManagerView.closeAddTaskPrompt(false);
    }

    // Open the Search Task prompt only if it is not already open
    if (!this.lms.searchTaskPromptLm.classList.contains('active')) {
      this.taskManagerView.openSearchTaskPrompt();  
    } 
    else {
      this.taskManagerView.closeSearchTaskPrompt();
    }
  }

  getTaskId(e) {
    const strId = e.target.closest('.task-manager__task').id;
    const match = strId.match(/-(\d+)$/);
    return match ? match[1] : null;
  }

  handleSwitchTab(e) {
    const clickedTab = e.target.closest('.task-manager__tab-btn') || e.target.closest('.enhanced-task-manager__tab-btn');

    if (clickedTab) {
      // User clicked the same tab
      if (clickedTab.id === localStorage.getItem('currentActiveTabId')) {
        return;
      }

      this.taskManagerView.scrollToTop('auto', this.isEnhancedTaskManager);
      this.taskManagerView.toggleActiveTab(clickedTab);
      this.getAllTasks();
    }
  }

  validateDueDate(date) {
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(date)) return false;
    const parsedDate = new Date(date);
    return !isNaN(parsedDate.getTime());
  }

  getTitleError(title) {
    if (!title) {
      return 'Title field is required.';
    } 
    else if (title.length > 75) {
      return 'Title must be less than or equal to 75 characters.';
    }

    return null;
  }

  getDueDateError(dueDate) {
    if (!dueDate) {
      return 'Due date field is required.';
    } 
    else if (!this.validateDueDate(dueDate)) {
      return 'Due date must be in YYYY-MM-DD format and also be valid.';
    }

    return null;
  }

  getDescriptionError(description) {
    if (description && description.length > 500) {
      return 'Description must be less than or equal to 500 characters.';
    }

    return null;
  }

  getValidationErrors(taskData) {
    return {
      title: this.getTitleError(taskData.title),
      due_date: this.getDueDateError(taskData.due_date),
      description: this.getDescriptionError(taskData.description)
    };
  }
}