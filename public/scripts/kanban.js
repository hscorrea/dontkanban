new Vue({
  el: '#app',
  data: {
    kanban: {
      title: '',
      tasks: []
    },
    newTask: {
      column: 1,
      description: '',
      color: ''
    },
    taskBeingMoved: {},
    dragCounter: 0,
    detailsAreVisible: false
  },
  methods: {
    goBackToHome(){
      window.location = '/';
    },
    validateNewTask(){
      if (this.newTask.description.length > 0) {
        this.addTask();
        this.newTask = {column: 1};
      }
    },
    addTask(){
      const path = location.pathname;
      const colors = ['blue', 'green', 'orange', 'pink', 'purple', 'red', 'yellow'];
      const randomNumber = Math.floor((Math.random() * colors.length));
      this.newTask.color = colors[randomNumber];
      this.kanban.tasks.push(this.newTask);
      this.$http.post('/' + this.kanban.title + '/add-task', this.newTask, {headers: {'Content-Type': 'application/json'}});
    },
    showDetails(task){
      this.detailsAreVisible = !this.detailsAreVisible;
    },
    dragTask(task){
      if (this.dragCounter++ > 0) return;
      this.taskBeingMoved = task;
      const indexOfTask = this.kanban.tasks.indexOf(this.taskBeingMoved);
      this.kanban.tasks.splice(indexOfTask, 1);
    },
    dropTask(event){
      this.dragCounter = 0;
      const targetHasId = event.target.id;
      let targetColumn;
      if (targetHasId) {
        targetColumn = parseInt(event.target.id.replace(/\D/g, ''));
      } else {
        targetColumn = parseInt(event.target.parentNode.parentNode.id.replace(/\D/g, ''));
      }
      if (targetColumn >= 1 && targetColumn <= 3) this.taskBeingMoved.column = targetColumn;
      this.kanban.tasks.push(this.taskBeingMoved);
      this.$http.post('/' + this.kanban.title + '/move-task', this.taskBeingMoved, {headers: {'Content-Type': 'application/json'}});
    }
  },
  mounted(){
    const path = location.pathname;
    const kanbanTitle = path.slice(1);
    this.kanban.title = kanbanTitle;
    this.$http.get(path + '/fetch-data').then(function(kanbanDocument){
      if (kanbanDocument.body[0]) {
        this.kanban = kanbanDocument.body[0];
      } else {
        this.$http.post('/create-kanban', this.kanban, {headers: {'Content-Type': 'application/json'}});
      }
    });
  }
});
